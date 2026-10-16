-- ===========================================================================
-- Read-only database role for the public Web GIS API
-- ===========================================================================
-- SECURITY PRINCIPLE (least privilege): the FastAPI backend is internet-facing,
-- so it must NEVER connect as a superuser. This role can only SELECT. Even if
-- an attacker found a SQL-injection hole, they could not INSERT, UPDATE,
-- DELETE, DROP, or alter the active flag — the entire database is read-only to
-- the web tier. Scenario generation (the only writes) is done offline by the
-- analyst as the postgres user, never through the API.
--
-- Run once, as postgres:
--   psql -U postgres -d healthcare_accessibility -f create_readonly_role.sql
-- ===========================================================================

-- 1. Create the login role (change the password before running)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gis_readonly') THEN
        CREATE ROLE gis_readonly LOGIN PASSWORD 'readonly_pass_change_me';
    END IF;
END
$$;

-- 2. Allow it to connect to this database and use the public schema
GRANT CONNECT ON DATABASE healthcare_accessibility TO gis_readonly;
GRANT USAGE   ON SCHEMA public TO gis_readonly;

-- 3. Grant SELECT on all existing tables, views, and sequences
GRANT SELECT ON ALL TABLES    IN SCHEMA public TO gis_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO gis_readonly;

-- 4. Make the grant apply to objects created in the future as well
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES    TO gis_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO gis_readonly;

-- 5. (defence in depth) make sure it has no write rights anywhere
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM gis_readonly;

-- Verify:  \du gis_readonly      (should show only "LOGIN", no superuser/createdb)
