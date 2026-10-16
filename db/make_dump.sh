#!/usr/bin/env bash
# Generate db/init/02_data.sql.gz from a live healthcare_accessibility DB.
# Dumps only the runtime tables/views (excludes routing tables). PostGIS only.
set -euo pipefail
PGBIN="${PGBIN:-/c/Program Files/PostgreSQL/17/bin}"
HOST="${PGHOST:-127.0.0.1}"; PORT="${PGPORT:-5432}"; DB="${PGDB:-healthcare_accessibility}"
USER="${PGUSER:-postgres}"
OUT="$(dirname "$0")/init/02_data.sql.gz"

"$PGBIN/pg_dump" -U "$USER" -h "$HOST" -p "$PORT" -d "$DB" \
  --no-owner --no-privileges --extension=postgis \
  --exclude-table=road_network --exclude-table=road_network_vertices_pgr \
  --exclude-table=network_components --exclude-table=topology \
  --exclude-table=layer --exclude-table=spatial_ref_sys \
  | grep -vE '^[\](un)?restrict ' \
  | gzip > "$OUT"
# ^ strip psql \restrict / \unrestrict wrapper lines (emitted by pg_dump >= 17.6 /
#   Nov-2025 security release) so the dump also restores on the PostGIS 17-3.5 image
#   (psql 17.5), which doesn't understand them. [\] matches a literal backslash.
echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
