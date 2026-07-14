#!/usr/bin/env bash
# Backup de la base de datos Postgres del stack de producción.
# Uso:  ./scripts/backup.sh [directorio_destino]   (por defecto: ./backups)
set -euo pipefail

# Ubicarse en la raíz del repo (donde está el docker-compose.prod.yml)
cd "$(dirname "$0")/.."

# Cargar variables (POSTGRES_USER, POSTGRES_DB, ...) desde .env
if [ -f .env ]; then
  set -a; . ./.env; set +a
else
  echo "ERROR: falta el archivo .env en la raíz del proyecto." >&2
  exit 1
fi

COMPOSE="docker compose -f docker-compose.prod.yml"
BACKUP_DIR="${1:-backups}"
RETENTION=14   # cantidad de backups a conservar

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
