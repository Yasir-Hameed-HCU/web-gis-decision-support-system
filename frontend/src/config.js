// Central config for the Web GIS dashboard
// Relative paths → same-origin via the Vite dev proxy (and nginx in prod) = no CORS.
export const API_BASE = "/api/v1";                                  // FastAPI
export const WMS_BASE  = "/geoserver/healthcare_mv/wms";            // GeoServer
export const WFS_BASE  = "/geoserver/healthcare_mv/wfs";

export const SERVICES = ["surgery", "geriatrics", "emergency"];
export const SERVICE_LABEL = { surgery: "Surgery", geriatrics: "Geriatrics", emergency: "Emergency" };
export const MV_CENTER = [53.62, 12.45];
export const MV_ZOOM = 8;

// KHVVG coverage thresholds (minutes) - used for covered/uncovered cross-highlight
export const THRESHOLDS = { surgery: 30, geriatrics: 40, emergency: 30 };

// thematic palette for the fragility and vulnerability classes
export const CLASS_COLORS = { stable: "#1a9850", fragile: "#fdae61", critical: "#d73027" };

// legend breaks
export const ACCESS_BREAKS = [
  { label: "0-15 min", color: "#ffffb2" },
  { label: "15-30 min", color: "#fecc5c" },
  { label: "30-45 min", color: "#fd8d3c" },
  { label: "45-60 min", color: "#f03b20" },
  { label: "> 60 min", color: "#bd0026" },
];
export const CLASS_BREAKS = [
  { label: "Stable", color: "#1a9850" },
  { label: "Fragile", color: "#fdae61" },
  { label: "Critical", color: "#d73027" },
];
export const SCENARIO_BREAKS = [
  { label: "No change", color: "#e0e0e0" },
  { label: "+0-5 min", color: "#fddbc7" },
  { label: "+5-15 min", color: "#f4a582" },
  { label: "+15-30 min", color: "#d6604d" },
  { label: "> 30 min", color: "#b2182b" },
];

// basemaps (pale base + labels on top renders thematic colours best)
// All tile services below are key-free. CARTO basemaps now require an API key
// and return "API KEY REQUIRED" watermarked tiles, so they are not used.
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";
export const BASEMAPS = {
  light: {
    name: "Light",
    url: ESRI + "/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    labels: ESRI + "/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri',
  },
  minimal: {
    name: "Minimal",
    url: ESRI + "/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    labels: null,
    attribution: 'Tiles &copy; Esri',
  },
  streets: {
    name: "Streets",
    // OSM's volunteer tile servers block deployed applications under their tile
    // usage policy, so the street basemap is served from Esri like the others.
    url: ESRI + "/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    labels: null,
    attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
  },
  satellite: {
    name: "Satellite",
    url: ESRI + "/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labels: ESRI + "/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri',
  },
};

export const DATA_SOURCES = "Hospitals Krankenhausplan M-V / G-BA · Roads OSM/Geofabrik · Population Zensus 2022 · Boundaries BKG VG250";
export const CRS_NOTE = "Stored EPSG:25832 · served EPSG:4326";
export const DISCLAIMER = "Planning indicator only, not a clinical or hospital-closure decision tool.";
export const APP_VERSION = "v1.0 · 2026";
