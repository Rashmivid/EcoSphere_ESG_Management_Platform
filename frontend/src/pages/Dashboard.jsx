import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import api from "../api/client";
import Layout from "../components/Layout";

const PILLAR_COLORS = ["#00ffe0", "#a855f7", "#ffd700"];

function AnimatedCounter({ value, duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const end = parseFloat(value) || 0;
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * end * 10) / 10);
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{display}</span>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(10,14,26,0.95)", border: "1px solid rgba(0,255,224,0.3)", borderRadius: 8, padding: "0.5rem 0.75rem" }}>
      {label && <div style={{ color: "#00ffe0", fontSize: "0.7rem", fontFamily: "'Orbitron',sans-serif", marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: "0.8rem", color: p.color || "#e2e8f0" }}>{p.name}: <b>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</b></div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [overall, setOverall] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [govDash, setGovDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalcing, setRecalcing] = useState(false);
  const [flashScore, setFlashScore] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [overallRes, deptRes, govRes] = await Promise.all([
          api.get("/scoring/overall"),
          api.get("/org/departments"),
          api.get("/governance/dashboard"),
        ]);
        setOverall(overallRes.data);
        setDepartments(deptRes.data);
        setGovDash(govRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const recalc = async () => {
    setRecalcing(true);
    await api.post("/scoring/recalculate");
    const res = await api.get("/scoring/overall");
    setOverall(res.data);
    setFlashScore(true);
    setTimeout(() => setFlashScore(false), 1000);
    setRecalcing(false);
  };

  const deptMap = Object.fromEntries(departments.map(d => [d.id, d.name]));

  const pillarData = overall ? [
    { name: "Environmental", value: overall.department_scores.reduce((a, s) => a + s.environmental_score, 0) / (overall.department_scores.length || 1) },
    { name: "Social",        value: overall.department_scores.reduce((a, s) => a + s.social_score, 0)        / (overall.department_scores.length || 1) },
    { name: "Governance",    value: overall.department_scores.reduce((a, s) => a + s.governance_score, 0)    / (overall.department_scores.length || 1) },
  ] : [];

  const barData = overall ? overall.department_scores.map(s => ({
    name: deptMap[s.department_id] || `Dept ${s.department_id}`,
    Environmental: +s.environmental_score.toFixed(1),
    Social:        +s.social_score.toFixed(1),
    Governance:    +s.governance_score.toFixed(1),
  })) : [];

  const radarData = pillarData.map(p => ({ subject: p.name, value: +p.value.toFixed(1), fullMark: 100 }));

  const stats = [
    { label: "ESG Score",          value: overall?.overall_score ?? "—", color: "#00ffe0", icon: "⬡", shadow: "rgba(0,255,224,0.3)", sub: `Period: ${overall?.period ?? "—"}` },
    { label: "Open Issues",        value: govDash?.open_issues ?? 0,      color: "#f97316", icon: "⚠",  shadow: "rgba(249,115,22,0.3)", sub: "Compliance" },
    { label: "Overdue Issues",     value: govDash?.overdue_issues ?? 0,   color: "#ef4444", icon: "🔴", shadow: "rgba(239,68,68,0.3)",  sub: "Needs action" },
    { label: "Departments",        value: departments.length,             color: "#a855f7", icon: "🏛",  shadow: "rgba(168,85,247,0.3)", sub: "Tracked units" },
  ];

  return (
    <Layout>
      <div className="page-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.65rem", color: "rgba(0,255,224,0.5)", letterSpacing: "0.2em", marginBottom: 4 }}>
              ▶ COMMAND CENTER
            </div>
            <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "#fff", margin: 0 }}>
              Organization <span style={{ color: "#00ffe0", textShadow: "0 0 15px rgba(0,255,224,0.6)" }}>Dashboard</span>
            </h1>
          </div>
          <button onClick={recalc} disabled={recalcing} className="game-btn" style={{ padding: "0.6rem 1.25rem" }}>
            {recalcing ? "◌ COMPUTING..." : "⚡ RECALCULATE"}
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", color: "#00ffe0", fontSize: "0.9rem", letterSpacing: "0.15em" }}>
              ◌ LOADING INTEL...
            </div>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
              {stats.map((s, i) => (
                <div key={i} className="stat-card" style={{
                  animationDelay: `${i * 0.1}s`,
                  borderColor: `rgba(${s.color === "#00ffe0" ? "0,255,224" : s.color === "#f97316" ? "249,115,22" : s.color === "#ef4444" ? "239,68,68" : "168,85,247"},0.2)`,
                  transition: "all 0.3s",
                  ...(flashScore && i === 0 ? { boxShadow: "0 0 30px rgba(0,255,224,0.6)" } : {}),
                }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "2rem", fontWeight: 900, color: s.color, textShadow: `0 0 15px ${s.shadow}`, lineHeight: 1 }}>
                    <AnimatedCounter value={s.value} />
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              {/* Pie chart */}
              <div className="game-panel" style={{ padding: "1.5rem" }}>
                <div className="section-title">Pillar Breakdown</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pillarData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={4}>
                      {pillarData.map((_, i) => (
                        <Cell key={i} fill={PILLAR_COLORS[i % PILLAR_COLORS.length]} opacity={0.9} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                  {pillarData.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "rgba(255,255,255,0.6)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: PILLAR_COLORS[i] }} />
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar chart */}
              <div className="game-panel" style={{ padding: "1.5rem" }}>
                <div className="section-title">ESG Radar</div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(0,255,224,0.15)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "Orbitron" }} />
                    <Radar name="Score" dataKey="value" stroke="#00ffe0" fill="#00ffe0" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart */}
              <div className="game-panel" style={{ padding: "1.5rem" }}>
                <div className="section-title">Department Battle</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barSize={6}>
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }} />
                    <Bar dataKey="Environmental" fill="#00ffe0" radius={[4,4,0,0]} />
                    <Bar dataKey="Social"        fill="#a855f7" radius={[4,4,0,0]} />
                    <Bar dataKey="Governance"    fill="#ffd700" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department scores table */}
            {overall?.department_scores?.length > 0 && (
              <div className="game-panel" style={{ padding: "1.5rem" }}>
                <div className="section-title">Department Scoreboard</div>
                <table className="game-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Environmental</th>
                      <th>Social</th>
                      <th>Governance</th>
                      <th>Total</th>
                      <th>Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...overall.department_scores]
                      .sort((a, b) => (b.environmental_score + b.social_score + b.governance_score) - (a.environmental_score + a.social_score + a.governance_score))
                      .map((s, idx) => {
                        const total = ((s.environmental_score + s.social_score + s.governance_score) / 3).toFixed(1);
                        return (
                          <tr key={s.department_id}>
                            <td style={{ color: "#fff", fontWeight: 600 }}>{deptMap[s.department_id] || `Dept ${s.department_id}`}</td>
                            <td><span style={{ color: "#00ffe0" }}>{s.environmental_score.toFixed(1)}</span></td>
                            <td><span style={{ color: "#a855f7" }}>{s.social_score.toFixed(1)}</span></td>
                            <td><span style={{ color: "#ffd700" }}>{s.governance_score.toFixed(1)}</span></td>
                            <td style={{ fontWeight: 700, color: "#fff" }}>{total}</td>
                            <td className={`rank-${idx + 1}`} style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900 }}>
                              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
