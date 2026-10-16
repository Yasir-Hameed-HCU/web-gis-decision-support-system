import { SERVICES, SERVICE_LABEL, BASEMAPS, DATA_SOURCES, CRS_NOTE, DISCLAIMER, APP_VERSION } from "../config";
import Legend from "./Legend";

export default function Sidebar({
  serviceGroup, setServiceGroup, layers, setLayers,
  basemap, setBasemap, opacity, setOpacity, showLabels, setShowLabels,
  showDistricts, setShowDistricts, scenarioOn,
}) {
  const toggle = (k) => setLayers({ ...layers, [k]: !layers[k] });
  return (
    <aside className="sidebar">
      <h2 className="brand">Healthcare Access MV</h2>
      <p className="brand-sub">Decision-Support Platform</p>

      <section className="ctl">
        <h3>Service group</h3>
        <div className="seg">
          {SERVICES.map((s) => (
            <button key={s} className={serviceGroup === s ? "seg-btn active" : "seg-btn"} onClick={() => setServiceGroup(s)}>
              {SERVICE_LABEL[s]}
            </button>
          ))}
        </div>
      </section>

      <section className="ctl">
        <h3>Layers</h3>
        {[["accessibility", "Accessibility (travel time)"], ["fragility", "Fragility classes"],
          ["vulnerability", "Vulnerability (district)"], ["hospitals", "Hospitals"]].map(([k, label]) => (
          <label key={k} className="chk"><input type="checkbox" checked={layers[k]} onChange={() => toggle(k)} />{label}</label>
        ))}
        <label className="chk"><input type="checkbox" checked={showDistricts} onChange={() => setShowDistricts(!showDistricts)} />District boundaries</label>
        <label className="chk"><input type="checkbox" checked={showLabels} onChange={() => setShowLabels(!showLabels)} />Show hospital names</label>
        <div className="slider">
          <span>Layer opacity</span>
          <input type="range" min="0.3" max="0.9" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} />
        </div>
      </section>

      <section className="ctl">
        <h3>Basemap</h3>
        <div className="bm-grid">
          {Object.entries(BASEMAPS).map(([k, b]) => (
            <button key={k} className={basemap === k ? "seg-btn sm active" : "seg-btn sm"} onClick={() => setBasemap(k)}>{b.name}</button>
          ))}
        </div>
      </section>

      <Legend layers={layers} scenarioOn={scenarioOn} serviceGroup={serviceGroup} />

      <footer className="sidefoot">
        <div className="disclaimer">{DISCLAIMER}</div>
        <div className="src">{DATA_SOURCES}</div>
        <div className="src">{CRS_NOTE} · {APP_VERSION}</div>
      </footer>
    </aside>
  );
}
