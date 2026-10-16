// Scenario console - lists the pre-computed closure scenarios (/scenarios) and
// toggles the diverging-RdBu difference overlay (scenario_diff WMS) on the map.
// Rows are filtered to the service group currently selected in the sidebar, so
// each scenario appears once rather than three times (one row per service).
import { SERVICE_LABEL } from "../config";

export default function ScenarioConsole({ scenarios, scenarioOn, setScenarioOn, serviceGroup }) {
  const rows = (scenarios || []).filter(
    (s) => !s.service_group || s.service_group === serviceGroup
  );

  // "Scenario 1: Keystone removal — KMG Klinikum Güstrow"
  //   -> label "Scenario 1", detail "Keystone removal — KMG Klinikum Güstrow"
  const split = (name, i) => {
    const full = (name || `Scenario ${i + 1}`).toString();
    const m = full.match(/^(Scenario\s*\d+)\s*[:–—-]\s*(.*)$/);
    return m ? { label: m[1], detail: m[2] } : { label: full, detail: "" };
  };

  return (
    <div className="panel">
      <h3>Scenario console</h3>
      <label className="chk">
        <input type="checkbox" checked={scenarioOn} onChange={() => setScenarioOn(!scenarioOn)} />
        Show closure impact overlay (Scenario&nbsp;1 &middot; geriatrics)
      </label>
      <p className="muted small">Diverging RdBu = travel-time increase after closure.</p>

      {rows.length > 0 ? (
        <>
          <p className="muted small">
            Impact on <strong>{SERVICE_LABEL[serviceGroup] || serviceGroup}</strong> access.
            Population that falls outside the travel-time threshold after closure.
          </p>
          <table className="mini">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Cells lost</th>
                <th>Pop. affected</th>
                <th>Elderly</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => {
                const { label, detail } = split(s.scenario_name || s.scenario, i);
                return (
                  <tr key={i}>
                    <td>
                      <strong>{label}</strong>
                      {detail && <><br /><span className="muted small">{detail}</span></>}
                    </td>
                    <td>{(s.cells_lost_access ?? 0).toLocaleString("en-US")}</td>
                    <td>{(s.population_affected ?? s.pop_affected ?? 0).toLocaleString("en-US")}</td>
                    <td>{(s.elderly_affected ?? 0).toLocaleString("en-US")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : <p className="muted small">Scenario ranking unavailable.</p>}
    </div>
  );
}
