-- Runs first on a fresh PostGIS container (docker-entrypoint-initdb.d).
-- Routing (pgRouting) is precomputed; the runtime app only needs PostGIS.
CREATE EXTENSION IF NOT EXISTS postgis;
