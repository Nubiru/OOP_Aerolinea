#!/bin/sh
# =============================================================================
# Entrypoint del container.
#
# Si AUTO_SEED=true y la DB no existe, corre el seed antes de arrancar el
# servidor. Pensado para hosts sin disco persistente (ej. Render free tier).
#
# Variables:
#   AUTO_SEED   "true" para sembrar si falta la DB. Default: false
#   DB_PATH     Ruta de la DB SQLite. Default: /app/data/aerolinea.db
# =============================================================================
set -e

DB_PATH="${DB_PATH:-/app/data/aerolinea.db}"

if [ "${AUTO_SEED:-false}" = "true" ] && [ ! -f "$DB_PATH" ]; then
  echo "[start] AUTO_SEED=true y DB no encontrada en $DB_PATH — sembrando..."
  node dist/seed.js
  echo "[start] Seed completado."
fi

exec node dist/index.js
