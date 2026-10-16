# Web GIS Decision Support System

Healthcare accessibility and service fragility analysis under hospital
restructuring, built for Mecklenburg-Vorpommern, Germany's least densely
populated state.

The system routes a 1 km population grid to every hospital over the road
network, classifies each cell against a policy travel-time threshold per
service, scores it for fragility, and recomputes the whole surface under
hospital closure scenarios. It runs from a single compose file.

## What it does

- **Travel time.** A full origin-to-destination matrix from every populated 1 km
  cell to every hospital, computed with pgRouting over an OpenStreetMap network.
- **Coverage.** Each cell is covered or not against the threshold for its
  service group: surgical, internal medicine and geriatric care.
- **Fragility.** A four-component score per cell from travel time, the time
  penalty to the second-nearest provider, threshold breach and the share of
  residents aged 65 and over, weighted by the analytic hierarchy process and
  classed as stable, fragile or critical.
- **Redundancy.** How many service-capable hospitals a cell can reach inside the
  threshold, which is the variable a coverage statistic cannot express.
- **Closure scenarios.** Clearing a hospital's active flag re-derives the nearest
  open provider for every cell straight from the stored matrix and writes the
  result under a new scenario identifier. Nothing is deleted, the baseline
  stays intact, and no re-routing is needed.
- **Services.** Every layer is published over Web Map Service and Web Feature
  Service and drawn in a React and Leaflet client.

## Architecture

| Layer | Technology |
|---|---|
| Database | PostgreSQL 17, PostGIS, pgRouting |
| Routing | `pgr_dijkstraCost`, many to many |
| Services | GeoServer 2.28, SQL views and Styled Layer Descriptor styling |
| Application programming interface | FastAPI, async, read-only |
| Client | React 19, Vite, Leaflet, React-Leaflet |
| Deployment | Docker Compose, nginx serving the built client and proxying the API and the services |

Geometry is stored and computed in ETRS89 / UTM zone 32N, EPSG:25832, and served
as EPSG:4326.

## Running it

```bash
git clone <this repository>
cd web-gis-decision-support-system
cp backend/.env.example backend/.env     # set your own database password
docker compose up -d
```

- Client: `http://localhost`
- Application programming interface and its documentation: `http://localhost:8000/docs`
- GeoServer: `http://localhost:8080/geoserver`

**The database starts empty.** `db/init` holds the extensions, the read-only
role and the grants; `db/make_dump.sh` and `db/make_dump.ps1` build a dump from a
populated instance. The analysis data is not distributed here, see **Data** below.

## Layout

```
backend/              FastAPI application, routers, database access
frontend/             React and Leaflet client
geoserver/sql_views/  SQL behind each published layer, with its styling
db/                   extensions, role, grants and dump tooling
docker-compose.yml
```

## Endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/api/v1/health` | liveness and database connectivity |
| GET | `/api/v1/hospitals` | hospital point layer as GeoJSON |
| GET | `/api/v1/accessibility` | travel-time surface as GeoJSON |
| GET | `/api/v1/fragility` | fragility surface with its components |
| GET | `/api/v1/statistics` | coverage aggregated by district and service |
| GET | `/api/v1/scenarios` | the closure scenarios and their impact |
| GET | `/api/v1/mcda` | multi-criteria vulnerability score per district |
| WS | `/api/v1/ws/progress` | progress channel for long operations |

The API is read-only by design. Scenarios are computed offline and served from
stored results; no endpoint writes to the database.

## Data

The analysis uses open data, none of which is redistributed here:

| Layer | Source |
|---|---|
| Hospital locations and capacities | Krankenhausplan des Landes Mecklenburg-Vorpommern, Stand Dezember 2022 |
| Service profiles | Gemeinsamer Bundesausschuss, Qualitätsberichte der Krankenhäuser |
| Road network | OpenStreetMap via Geofabrik |
| Population grid | Zensus 2022, 1 km grid |
| Administrative boundaries | Bundesamt für Kartographie und Geodäsie, VG250 |

The populated database is deliberately not published. The hospital register is
under revision, and shipping a snapshot known to be superseded would be worse
than shipping none. The schema, the queries and the tooling are all here, so the
analysis can be rebuilt from the sources above.

## Status

Built for an M.Sc. thesis in Geodesy and Geoinformatics at HafenCity University
Hamburg, submitted and defended in 2026. Published as a record of the
implementation rather than as a maintained product, but questions are welcome.

## Licence

MIT, see `LICENSE`.
