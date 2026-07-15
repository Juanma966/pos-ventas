#!/usr/bin/env bash
# Backup de la base de datos Postgres de un stack.
# Uso:  ./scripts/backup.sh [env_file] [proyecto]
#   env_file  archivo de variables (por defecto: .env). Para un cliente: clientes/<slug>.env
#   proyecto  nombre del proyecto compose (-p). Para un cliente suele ser el slug.
set -euo pipefail

# Ubicarse en la raíz del repo (donde está el docker-compose.prod.yml)
cd "$(dirname "$0")/.."

ENVFILE="${1:-.env}"
PROJECT="${2:-}"
RETENTION=14   # cantidad de backups a conservar

if [ ! -f "$ENVFILE" ]; then
  echo "ERROR: no existe el archivo de entorno '$ENVFILE'." >&2
  exit 1
fi

# Cargar variables (POSTGRES_USER, POSTGRES_DB, STACK_NAME, ...)
set -a; . "$ENVFILE"; set +a

COMPOSE="docker compose"
[ -n "$PROJECT" ] && COMPOSE="$COMPOSE -p $PROJECT"
COMPOSE="$COMPOSE --env-file $ENVFILE -f docker-compose.prod.yml"

# Un subdirectorio por stack/cliente
BACKUP_DIR="backups/${STACK_NAME:-pos}"
mkdir -p "$BACKUP_DIR"
TS=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/${POSTGRES_DB}_${TS}.sql.gz"

echo "Generando backup de '$POSTGRES_DB' en $FILE ..."
# --clean --if-exists deja el dump listo para restaurar sobre una base existente.
$COMPOSE exec -T postgres \
  pg_dump --clean --if-exists -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  | gzip > "$FILE"

echo "Backup completo: $FILE ($(du -h "$FILE" | cut -f1))"

# Retención: conservar solo los últimos $RETENTION backups
ls -1t "$BACKUP_DIR"/"${POSTGRES_DB}"_*.sql.gz 2>/dev/null | tail -n +$((RETENTION + 1)) | while read -r old; do
  echo "Eliminando backup viejo: $old"
  rm -f "$old"
done
