// Aggregates the per-district statistics list (from /statistics) into MV totals.
export default function StatsPanel({ stats }) {
  if (!stats || stats.length === 0) return <div className="panel"><h3>Statistics</h3><p className="muted">No data.</p></div>;

  const sum = (k) => stats.reduce((a, r) => a + (r[k] || 0), 0);
  const popTotal = sum("population_total");
  const popCovered = sum("population_covered");
  const eldTotal = sum("elderly_total");
  const eldUncovered = sum("elderly_uncovered");
  const covPct = popTotal ? (100 * popCovered / popTotal) : 0;
  const fmt = (n) => n.toLocaleString("en-US");

  return (
    <div className="panel">
      <h3>Coverage (MV total)</h3>
      <div className="kpi-grid">
        <div className="kpi"><div className="kpi-val">{covPct.toFixed(1)}%</div><div className="kpi-lab">Population covered</div></div>
        <div className="kpi"><div className="kpi-val">{fmt(popCovered)}</div><div className="kpi-lab">Covered pop.</div></div>
        <div className="kpi"><div className="kpi-val">{fmt(popTotal - popCovered)}</div><div className="kpi-lab">Uncovered pop.</div></div>
        <div className="kpi"><div className="kpi-val">{fmt(eldUncovered)}</div><div className="kpi-lab">Elderly uncovered</div></div>
      </div>
      <p className="muted small">Σ population {fmt(popTotal)} · elderly {fmt(eldTotal)} · {stats.length} districts</p>
    </div>
  );
}
