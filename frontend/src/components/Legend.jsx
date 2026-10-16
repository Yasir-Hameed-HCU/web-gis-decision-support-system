import { ACCESS_BREAKS, CLASS_BREAKS, SCENARIO_BREAKS, SERVICE_LABEL, THRESHOLDS } from "../config";

// Legend reflects the TOP active thematic layer (priority: scenario > vulnerability
// > fragility > accessibility), so it always matches what's drawn on the map.
export default function Legend({ layers, scenarioOn, serviceGroup }) {
  let title = null, breaks = null, isAccess = false;
  if (scenarioOn) { title = "Scenario Δ travel time"; breaks = SCENARIO_BREAKS; }
  else if (layers.vulnerability) { title = "Vulnerability (MCDA)"; breaks = CLASS_BREAKS; }
  else if (layers.fragility) { title = "Fragility class"; breaks = CLASS_BREAKS; }
  else if (layers.accessibility) { title = `Travel time: ${SERVICE_LABEL[serviceGroup]}`; breaks = ACCESS_BREAKS; isAccess = true; }

  const T = THRESHOLDS[serviceGroup] ?? 30;
  const lowerBound = (label) => parseInt(label, 10) || 0; // "30-45 min" -> 30, "> 60 min" -> 60

  return (
    <section className="ctl legend">
      <h3>Legend</h3>
      {breaks ? (
        <>
          <div className="legend-title">{title}</div>
          {breaks.map((b) => {
            const atRisk = isAccess && lowerBound(b.label) >= T;
            return (
              <div key={b.label} className={atRisk ? "legend-row at-risk" : "legend-row"}>
                <span className="sw" style={{ background: b.color }} /> {b.label}{atRisk ? " ⚠" : ""}
              </div>
            );
          })}
          {isAccess && <div className="thr-note">⚠ Above <b>{T} min</b> = under-served (KHVVG threshold)</div>}
        </>
      ) : <div className="muted small">Enable a layer to show its legend.</div>}
      <div className="legend-sep" />
      <div className="legend-row"><span className="dot" style={{ background: "#d73027" }} /> Hospital (offers {SERVICE_LABEL[serviceGroup].toLowerCase()})</div>
      <div className="legend-row"><span className="ring" /> Hospital (other service)</div>
    </section>
  );
}
