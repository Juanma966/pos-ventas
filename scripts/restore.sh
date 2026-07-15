#!/usr/bin/env bash
# Restaura un backup en la base Postgres de un stack. OPERACIÓN DESTRUCTIVA.
# Uso:  ./scripts/restore.sh <archivo.sql.gz> [env_file] [proyecto]
#   env_file  archivo de variables (por defecto: .env). Para un cliente: clientes/<slug>.env
#   proyecto  nombre del proyecto compose (-p). Para un cliente suele ser el slug.
set -euo pipefail

cd "$(dirname "$0")/.."

FILE="${1:-}"
ENVFILE="${2:-.env}"
PROJECT="${3:-}"

if [ -z "$FILE" ]; then
  echo "Uso: ./scripts/restore.sh <archivo.sql.gz> [env_file] [proyecto]" >&2
  exit 1
fi
if [ ! -f "$FILE" ]; then
  echo "ERROR: no existe el archivo '$FILE'." >&2
  exit 1
fi
if [ ! -f "$ENVFILE" ]; then
  echo "ERROR: no existe el archivo de entorno '$ENVFILE'." >&2
  exit 1
fi

set -a; . "$ENVFILE"; set +a

COMPOSE="docker compose"
[ -n "$PROJECT" ] && COMPOSE="$COMPOSE -p $PROJECT"
COMPOSE="$COMPOSE --env-file $ENVFILE -f docker-compose.prod.yml"

echo "ADVERTENCIA: esto sobrescribe la base '$POSTGRES_DB' con el contenido de:"
echo "  $FILE"
read -r -p "Escribí 'si' para continuar: " confirm
if [ "$confirm" != "si" ]; then
  echo "Cancelado."
  exit 1
fi

echo "Restaurando ..."
gunzip -c "$FILE" | $COMPOSE exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
echo "Restore completo."
