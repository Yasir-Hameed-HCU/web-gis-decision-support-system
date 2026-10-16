# Backend

FastAPI application serving the analytical results over HTTP. Async throughout,
connection-pooled with asyncpg, and **read-only**: no endpoint writes to the
database.

## Running

```bash
cp .env.example .env          # set your own database password
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive documentation is then at `http://localhost:8000/docs`.

Under Docker the service is built from `Dockerfile` and reaches the database as
host `db`, see `docker-compose.yml` at the repository root.

## Endpoints

All are mounted under `/api/v1`.

| Method | Path | Returns |
|---|---|---|
| GET | `/health` | liveness and database connectivity |
| GET | `/hospitals` | hospital point layer as GeoJSON |
| GET | `/accessibility` | travel-time surface as GeoJSON polygons |
| GET | `/fragility` | fragility surface and its four components |
| GET | `/statistics` | coverage by district and service group |
| GET | `/scenarios` | closure scenarios and their impact |
| GET | `/scenario/{n}/diff` | per-cell difference for one scenario |
| GET | `/mcda` | multi-criteria vulnerability score per district |
| WS | `/ws/progress` | progress channel for long operations |

## Design

- **GeoJSON is built inside PostGIS.** `ST_AsGeoJSON` and `json_build_object` do
  the assembly, so a surface is one round trip and no geometry is reshaped in
  Python.
- **Configuration comes from the environment.** Nothing is hard-coded; see
  `app/config.py` and `.env.example`.
- **The database role is least-privilege.** `sql/create_readonly_role.sql`
  creates a login that can connect and select and nothing else.
- **Scenarios are pre-computed.** They are derived offline from the stored
  travel-time matrix and served from `scenario_results`.
