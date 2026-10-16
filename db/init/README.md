# Database bootstrap

These files run **in alphabetical order** the first time the `db` container's
data volume is empty, so `docker compose up` brings a usable database online.

| File | Role |
|---|---|
| `00_extensions.sql` | `CREATE EXTENSION postgis`. pgRouting is not required at runtime, because routing is pre-computed |
| `01_create_readonly_role.sql` | creates the `gis_readonly` login role with CONNECT and USAGE |
| `03_grants.sql` | grants SELECT only to that role and revokes writes |

## The data

**The populated database is not distributed with this repository**, so the
containers start with an empty schema and the client will show no layers until
data is loaded. See the Data section of the root README for the sources.

If you have a populated `healthcare_accessibility` database, you can produce a
dump that this directory will load automatically on first start:

```bash
db/make_dump.sh            # or db\make_dump.ps1 on Windows
```

That writes `db/init/02_data.sql.gz`, which sorts between the role and the
grants and is therefore loaded after the role exists and before the grants are
applied. It dumps the runtime tables and views only, not the routing tables,
which the application does not read at runtime.

Then:

```bash
docker compose down -v && docker compose up --build
```
