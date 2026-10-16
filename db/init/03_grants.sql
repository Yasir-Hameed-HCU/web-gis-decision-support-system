-- Runs after the data dump (02_data.sql.gz) loads the tables/views.
-- Grant read-only SELECT to the backend/GeoServer role.
GRANT SELECT ON ALL TABLES    IN SCHEMA public TO gis_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO gis_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES    TO gis_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO gis_readonly;
-- enforce read-only: revoke any write privileges
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM gis_readonly;
