import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

// % label drawn INSIDE the donut ring (never clips the panel)
const insideLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

export default function Charts({ stats, onHighlight, onFocusDistrict }) {
  if (!stats || stats.length === 0) return null;

  // per-district coverage % (keep full name for click-to-zoom)
  const bars = stats.map((r) => ({
    district: r.district?.replace("Landkreis ", "LK ").slice(0, 14) ?? "?",
    full: r.district,
    coverage: r.coverage_pct ?? 0,
  })).sort((a, b) => a.coverage - b.coverage);

  const barColor = (v) => (v >= 80 ? "#1a9850" : v >= 50 ? "#fdae61" : "#d73027");

  const popTotal = stats.reduce((a, r) => a + (r.population_total || 0), 0);
  const popCov = stats.reduce((a, r) => a + (r.population_covered || 0), 0);
  const pie = [
    { name: "Covered", value: popCov, fill: "#1a9850" },
    { name: "Uncovered", value: Math.max(popTotal - popCov, 0), fill: "#d73027" },
  ];

  return (
    <div className="panel">
      <h3>Coverage by district (%)</h3>
      <p className="muted small" style={{ marginTop: -4 }}>Click a bar to zoom to the district.</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={bars} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="district" width={90} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Bar dataKey="coverage" radius={[0, 3, 3, 0]} cursor="pointer"
               onClick={(d) => onFocusDistrict && onFocusDistrict(d && (d.full || d.payload?.full))}>
            {bars.map((b, i) => <Cell key={i} fill={barColor(b.coverage)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <h3 style={{ marginTop: 10 }}>Population covered vs uncovered</h3>
      <p className="muted small" style={{ marginTop: -4 }}>Hover a segment to highlight it on the map.</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart margin={{ top: 8, bottom: 4, left: 4, right: 4 }}>
          <Pie data={pie} dataKey="value" nameKey="name" cx="50%" cy="46%"
               innerRadius={42} outerRadius={66} paddingAngle={1} labelLine={false} label={insideLabel}
               onMouseEnter={(d) => onHighlight && onHighlight(d.name.toLowerCase())}
               onMouseLeave={() => onHighlight && onHighlight(null)} />
          <Tooltip formatter={(v) => v.toLocaleString("en-US")} />
          <Legend verticalAlign="bottom" height={22} iconType="circle"
               onMouseEnter={(o) => onHighlight && onHighlight(String(o.value).toLowerCase())}
               onMouseLeave={() => onHighlight && onHighlight(null)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
