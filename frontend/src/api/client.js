// Axios clients for the FastAPI backend. All GeoJSON/JSON in EPSG:4326.
import axios from "axios";
import { API_BASE, WFS_BASE } from "../config";

const api = axios.create({ baseURL: API_BASE, timeout: 30000 });

// District boundaries (GeoJSON) from GeoServer WFS (same-origin via proxy)
export const getDistricts = () =>
  fetch(`${WFS_BASE}?service=WFS&version=2.0.0&request=GetFeature&typeNames=healthcare_mv:districts&outputFormat=application/json`)
    .then((r) => r.json());

export const getHealth      = ()        => api.get("/health").then(r => r.data);
export const getHospitals   = (service) => api.get("/hospitals",   { params: { service, active: 1 } }).then(r => r.data);
export const getStatistics  = (service_group) => api.get("/statistics", { params: { service_group } }).then(r => r.data);
export const getMCDA        = (service_group) => api.get("/mcda",       { params: { service_group } }).then(r => r.data);
export const getScenarios   = ()        => api.get("/scenarios").then(r => r.data);

export default api;
