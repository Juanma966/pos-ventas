#!/usr/bin/env bash
# Alta de un cliente nuevo (Modelo A: una instalación por cliente).
# Crea un stack Docker aislado (contenedores, base y volumen propios) a partir
# de docker-compose.prod.yml, con secretos únicos, lo levanta y siembra el admin.
#
# Uso:  ./scripts/nuevo-cliente.sh <slug> [puerto] [dominio]
#   slug    identificador del cliente (a-z, 0-9, guiones). Ej: panaderia-lopez
#   puerto  puerto HTTP en el host (opcional; si se omite, busca uno libre desde 8080)
#   dominio URL pública para CORS (opcional; ej: https://panaderia.midominio.com)
set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE_FILE="docker-compose.prod.yml"
CLIENTS_DIR="clientes"

# --- Argumentos ---
SLUG="${1:-}"
PORT="${2:-}"
DOMAIN="${3:-}"

if [ -z "$SLUG" ]; then
  echo "Uso: ./scripts/nuevo-cliente.sh <slug> [puerto] [dominio]" >&2
  exit 1
fi
if ! echo "$SLUG" | grep -qE '^[a-z0-9][a-z0-9-]*$'; then
  echo "ERROR: el slug solo puede tener minúsculas, números y guiones (ej: panaderia-lopez)." >&2
  exit 1
fi

mkdir -p "$CLIENTS_DIR"
ENVFILE="$CLIENTS_DIR/${SLUG}.env"
if [ -f "$ENVFILE" ]; then
  echo "ERROR: el cliente '$SLUG' ya existe ($ENVFILE)." >&2
  echo "Para re-levantarlo: docker compose -p $SLUG --env-file $ENVFILE -f $COMPOSE_FILE up -d" >&2
  exit 1
fi

# --- Puerto: buscar uno libre desde 8080 si no se indicó ---
port_in_use() { { exec 3<>"/dev/tcp/127.0.0.1/$1"; } 2>/dev/null && { exec 3>&-; return 0; } || return 1; }
if [ -z "$PORT" ]; then
  PORT=8080
  while port_in_use "$PORT"; do PORT=$((PORT + 1)); done
elif port_in_use "$PORT"; then
  echo "ERROR: el puerto $PORT ya está en uso." >&2
  exit 1
fi

[ -z "$DOMAIN" ] && DOMAIN="http://localhost:${PORT}"

# --- Secretos únicos ---
secret() { openssl rand -base64 48 | tr -d '\n/+='; }   # alfanumérico, sin saltos
DBPASS=$(openssl rand -hex 24)
JWTA=$(secret)
JWTR=$(secret)

# --- Escribir el .env del cliente ---
cat > "$ENVFILE" <<EOF
# Cliente: $SLUG  (generado por nuevo-cliente.sh el $(date +%Y-%m-%d))
STACK_NAME=$SLUG

POSTGRES_DB=pos_${SLUG//-/_}
POSTGRES_USER=pos_${SLUG//-/_}
POSTGRES_PASSWORD=$DBPASS

JWT_ACCESS_SECRET=$JWTA
JWT_REFRESH_SECRET=$JWTR
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=$DOMAIN
HTTP_PORT=$PORT
EOF
chmod 600 "$ENVFILE"
echo "→ Configuración generada: $ENVFILE"

DC="docker compose -p $SLUG --env-file $ENVFILE -f $COMPOSE_FILE"

echo "→ Levantando el stack (build + up)..."
$DC up -d --build

echo "→ Esperando a que el backend esté sano..."
until [ "$(docker inspect --format '{{.State.Health.Status}}' "${SLUG}-backend" 2>/dev/null)" = "healthy" ]; do
  sleep 3
done

echo "→ Sembrando datos iniciales (admin)..."
$DC exec -T backend pnpm db:seed

cat <<EOF

============================================================
 Cliente '$SLUG' listo ✅
------------------------------------------------------------
 URL:        $DOMAIN   (puerto host: $PORT)
 Admin:      admin@pos.com  /  admin123   (CAMBIAR al entrar)
 Config:     $ENVFILE   (contiene secretos, no se commitea)
------------------------------------------------------------
 Operar:     docker compose -p $SLUG --env-file $ENVFILE -f $COMPOSE_FILE <cmd>
 Backup:     ./scripts/backup.sh $ENVFILE $SLUG
 Apagar:     docker compose -p $SLUG --env-file $ENVFILE -f $COMPOSE_FILE down
============================================================
EOF
