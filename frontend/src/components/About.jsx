import { DATA_SOURCES, CRS_NOTE, APP_VERSION } from "../config";

export default function About({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        <h2>About this platform</h2>
        <p>An open-source Web GIS decision-support platform for healthcare accessibility and
          service-fragility analysis under hospital restructuring (KHVVG 2024) in
          Mecklenburg-Vorpommern, Germany.</p>

        <h3>Methods</h3>
        <ul>
          <li><b>Accessibility</b>: road-network travel time (pgRouting OD matrix) to the nearest hospital per 1 km cell.</li>
          <li><b>KHVVG thresholds</b>: surgery 30 min · geriatrics 40 min · emergency 30 min.</li>
          <li><b>Fragility index</b>: 0.35·travel + 0.30·redundancy gap + 0.20·threshold exceedance + 0.15·elderly fraction (AHP-weighted); classes stable / fragile / critical.</li>
          <li><b>Vulnerability (MCDA)</b>: district-level composite of travel, redundancy, coverage margin and elderly share.</li>
          <li><b>Scenarios</b>: non-destructive hospital-closure simulation (active-flag re-aggregation).</li>
        </ul>

        <h3>Architecture</h3>
        <p>QGIS → PostGIS / pgRouting → FastAPI (GeoJSON) → GeoServer (WMS/WFS) → React + Leaflet.
          Heavy surfaces are served as WMS tiles; interactive vectors as GeoJSON.</p>

        <h3>Data &amp; provenance</h3>
        <p className="src">{DATA_SOURCES}</p>
        <p className="src">{CRS_NOTE} · {APP_VERSION}</p>

        <p className="disclaimer">Outputs are planning indicators only, not a clinical or
          hospital-closure decision tool.</p>
      </div>
    </div>
  );
}
