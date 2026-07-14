#!/usr/bin/env bash
# Restaura un backup en la base Postgres del stack. OPERACIÓN DESTRUCTIVA.
# Uso:  ./scripts/restore.sh <archivo.sql.gz>
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a; . ./.env; set +a
else
  echo "ERROR: falta el archivo .env en la raíz del proyecto." >&2
  exit 1
fi

COMPOSE="docker compose -f docker-compose.prod.yml"
FILE="${1:-}"

if [ -z "$FILE" ]; then
  echo "Uso: ./scripts/restore.sh <archivo.sql.gz>" >&2
  exit 1
fi
if [ ! -f "$FILE" ]; then
  echo "ERROR: no existe el archivo '$FILE'." >&2
  exit 1
fi

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
