-- Least-privilege login role used by the FastAPI backend + GeoServer store.
-- Password comes from the RO_PASSWORD compose env in production; default here for the
-- self-contained stack — change it for any non-local deployment.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gis_readonly') THEN
    CREATE ROLE gis_readonly LOGIN PASSWORD 'readonly_pass_change_me';
  END IF;
END$$;

GRANT CONNECT ON DATABASE healthcare_accessibility TO gis_readonly;
GRANT USAGE   ON SCHEMA public TO gis_readonly;
-- table-level SELECT grants are applied in 03_grants.sql, after the data load.
