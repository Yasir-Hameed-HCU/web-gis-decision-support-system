# Frontend

React and Leaflet client for the Web GIS Decision Support System. Built with
Vite.

## Running

```bash
npm install
npm run dev          # http://localhost:5173
```

The development server expects the API on `http://localhost:8000` and GeoServer
on `http://localhost:8080`; both are set in `src/config.js`.

For production, `npm run build` emits a static bundle that `Dockerfile` serves
through nginx, which also proxies `/api` and `/geoserver` so the browser sees a
single origin. See `nginx.conf`.

## Structure

```
src/api/client.js          thin wrapper over the API endpoints
src/components/MapView     Leaflet map, raster layers and cell queries
src/components/Sidebar     service group, layer and basemap controls
src/components/StatsPanel  coverage figures for the selected service
src/components/Charts      coverage and fragility distributions
src/components/ScenarioConsole  closure scenarios and their impact
src/components/VulnerabilityPanel  multi-criteria score per district
src/components/Legend      class and ramp legends
src/config.js              endpoints, basemaps, colour ramps and class colours
```

Raster layers come from GeoServer as Web Map Service tiles. Vector queries,
statistics and scenarios come from the API.
