import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

/* ── Animated counter ── */
function useCounter(target, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const end = typeof target === "number" ? target : 0;
    const t = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p >= 1) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

function StatCard({ label, value, icon, color, sub }) {
  const animated = useCounter(typeof value === "number" ? value : 0);
  return (
    <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: "1.4rem" }}>{icon}</div>
      </div>
      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "2rem", fontWeight: 900, color, marginBottom: 4 }}>
        {typeof value === "number" ? animated : value}
      </div>
      {sub && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

const PIE_COLORS = ["#16a34a", "#2563eb", "#d97706", "#7c3aed", "#0891b2"];

export default function Dashboard() {
  const [esgData, setEsgData]       = useState(null);
  const [deptScores, setDeptScores] = useState([]);
  const [transactions, setTx]       = useState([]);
  const [activities, setActs]       = useState([]);
  const [issues, setIssues]         = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [departments, setDepts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch data from all modules for a comprehensive dashboard
        const results = await Promise.allSettled([
          api.get("/scoring/overall"),
          api.get("/environmental/carbon-transactions"),
          api.get("/social/activities"),
          api.get("/governance/compliance-issues"),
          api.get("/gamification/challenges", { params: { status: "active" } }),
          api.get("/org/departments"),
        ]);

        // Extract results safely
        if (results[0].status === "fulfilled") {
          setEsgData(results[0].value.data);
          setDeptScores(results[0].value.data.department_scores || []);
        }
        if (results[1].status === "fulfilled") setTx(results[1].value.data || []);
        if (results[2].status === "fulfilled") setActs(results[2].value.data || []);
        if (results[3].status === "fulfilled") setIssues(results[3].value.data || []);
        if (results[4].status === "fulfilled") setChallenges(results[4].value.data || []);
        if (results[5].status === "fulfilled") setDepts(results[5].value.data || []);
      } catch (e) {
        console.error("Dashboard load error:", e);
        setError("Some data could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const overall    = esgData?.overall_score ?? 0;
  const totalCO2   = transactions.reduce((s, t) => s + (t.calculated_co2 || 0), 0);
  const openIssues = issues.filter(i => i.status === "open" || i.status === "in_progress").length;
  const deptName   = (id) => departments.find(d => d.id === id)?.name || `Dept #${id}`;

  // Chart data
  const radarData = deptScores.slice(0, 6).map(d => ({
    dept: deptName(d.department_id),
    Environmental: d.environmental_score,
    Social: d.social_score,
    Governance: d.governance_score,
  }));

  const barData = deptScores.map(d => ({
    name: deptName(d.department_id),
    E: d.environmental_score,
    S: d.social_score,
    G: d.governance_score,
    Total: d.total_score,
  }));

  // Pie chart - ESG weight split based on average scores
  const avgE = deptScores.length ? Math.round(deptScores.reduce((a, d) => a + d.environmental_score, 0) / deptScores.length) : 0;
  const avgS = deptScores.length ? Math.round(deptScores.reduce((a, d) => a + d.social_score, 0) / deptScores.length) : 0;
  const avgG = deptScores.length ? Math.round(deptScores.reduce((a, d) => a + d.governance_score, 0) / deptScores.length) : 0;

  const pieData = [
    { name: "Environmental", value: avgE || 1 },
    { name: "Social", value: avgS || 1 },
    { name: "Governance", value: avgG || 1 },
  ];

  const STATS = [
    { label: "Overall ESG Score", value: overall,              icon: "⬡",  color: "#0891b2", sub: `Period: ${esgData?.period ?? "—"}` },
    { label: "Departments",       value: departments.length,   icon: "🏛",  color: "#6366f1", sub: "Tracked units" },
    { label: "Carbon CO₂ (kg)",   value: Math.round(totalCO2), icon: "🌍",  color: "#16a34a", sub: `${transactions.length} transactions` },
    { label: "CSR Activities",    value: activities.length,    icon: "🤝",  color: "#2563eb", sub: "Active missions" },
    { label: "Compliance Issues", value: openIssues,           icon: "⚠",  color: "#d97706", sub: `${issues.length} total` },
    { label: "Active Challenges", value: challenges.length,    icon: "⚔",  color: "#7c3aed", sub: "Gamification quests" },
  ];

  return (
    <Layout>
      <div className="page-enter">
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.6rem", color: "#0891b2", letterSpacing: "0.2em", marginBottom: 4, fontWeight: 700 }}>
            ▶ COMMAND CENTER
          </div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
            ESG <span style={{ background: "linear-gradient(135deg,#06b6d4,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Dashboard</span>
          </h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, flexDirection: "column", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(6,182,212,0.2)", borderTop: "3px solid #06b6d4", animation: "spin 1s linear infinite" }} />
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.15em" }}>LOADING DASHBOARD...</div>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
              {STATS.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

              {/* Radar Chart */}
              <div className="game-panel" style={{ padding: "1.5rem" }}>
                <div className="section-title" style={{ color: "#0891b2" }}>
                  <span>📡</span> ESG Radar — Department Performance
                  <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(6,182,212,0.3),transparent)" }} />
                </div>
                {radarData.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem" }}>
                    NO SCORES YET — Go to Admin → Recompute Scores
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(99,102,241,0.15)" />
                      <PolarAngleAxis dataKey="dept" tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }} />
                      <Radar name="Environmental" dataKey="Environmental" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} strokeWidth={2} />
                      <Radar name="Social" dataKey="Social" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} strokeWidth={2} />
                      <Radar name="Governance" dataKey="Governance" stroke="#d97706" fill="#d97706" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Bar Chart */}
              <div className="game-panel" style={{ padding: "1.5rem" }}>
                <div className="section-title" style={{ color: "#6366f1" }}>
                  <span>📊</span> Department Score Breakdown
                  <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(99,102,241,0.3),transparent)" }} />
                </div>
                {barData.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem" }}>
                    NO SCORES YET
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData} barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                      <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 10, color: "#0f172a", boxShadow: "0 4px 16px rgba(99,102,241,0.1)" }}
                        cursor={{ fill: "rgba(6,182,212,0.05)" }}
                      />
                      <Bar dataKey="E" name="Environmental" fill="#16a34a" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="S" name="Social" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="G" name="Governance" fill="#d97706" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Second row: Pie + Quick Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

              {/* Pie Chart */}
              <div className="game-panel" style={{ padding: "1.5rem" }}>
                <div className="section-title" style={{ color: "#16a34a" }}>
                  <span>🧩</span> ESG Score Distribution
                  <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(22,163,74,0.3),transparent)" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 10, color: "#0f172a", boxShadow: "0 4px 16px rgba(99,102,241,0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {[
                      { label: "Environmental", value: avgE, color: "#16a34a", icon: "🌿" },
                      { label: "Social", value: avgS, color: "#2563eb", icon: "🤝" },
                      { label: "Governance", value: avgG, color: "#d97706", icon: "⚖️" },
                    ].map(s => (
                      <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{s.icon} {s.label}</div>
                          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.9rem", fontWeight: 700, color: s.color }}>{s.value}/100</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Activity Feed */}
              <div className="game-panel" style={{ padding: "1.5rem" }}>
                <div className="section-title" style={{ color: "#7c3aed" }}>
                  <span>⚡</span> Quick Summary
                  <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(124,58,237,0.3),transparent)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {[
                    { icon: "🌍", text: `${transactions.length} carbon transactions logged`, color: "#16a34a" },
                    { icon: "🤝", text: `${activities.length} CSR activities available`, color: "#2563eb" },
                    { icon: "⚠", text: `${openIssues} open compliance issues`, color: openIssues > 0 ? "#dc2626" : "#16a34a" },
                    { icon: "⚔", text: `${challenges.length} active sustainability challenges`, color: "#7c3aed" },
                    { icon: "🏛", text: `${departments.length} departments tracked`, color: "#6366f1" },
                    { icon: "📊", text: `Overall ESG Score: ${overall}`, color: "#0891b2" },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "0.6rem 0.85rem", borderRadius: 10,
                      background: `${item.color}08`,
                      border: `1px solid ${item.color}18`,
                      transition: "all 0.2s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${item.color}12`; e.currentTarget.style.transform = "translateX(4px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${item.color}08`; e.currentTarget.style.transform = "translateX(0)"; }}
                    >
                      <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: 500 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department table */}
            {deptScores.length > 0 && (
              <div className="game-panel" style={{ padding: "1.5rem" }}>
                <div className="section-title" style={{ color: "#0891b2" }}>
                  <span>🏛</span> Department ESG Breakdown
                  <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(8,145,178,0.3),transparent)" }} />
                </div>
                <table className="game-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>🌿 Environmental</th>
                      <th>🤝 Social</th>
                      <th>⚖️ Governance</th>
                      <th>Total Score</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptScores.map(d => {
                      const t = d.total_score;
                      const grade = t >= 80 ? "A" : t >= 60 ? "B" : t >= 40 ? "C" : "D";
                      const gradeColor = t >= 80 ? "#16a34a" : t >= 60 ? "#2563eb" : t >= 40 ? "#d97706" : "#dc2626";
                      return (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{deptName(d.department_id)}</td>
                          <td><span style={{ color: "#16a34a", fontWeight: 600 }}>{d.environmental_score}</span></td>
                          <td><span style={{ color: "#2563eb", fontWeight: 600 }}>{d.social_score}</span></td>
                          <td><span style={{ color: "#d97706", fontWeight: 600 }}>{d.governance_score}</span></td>
                          <td style={{ fontFamily: "'Orbitron',sans-serif", color: "#0891b2", fontWeight: 700 }}>{d.total_score}</td>
                          <td>
                            <span className="game-badge" style={{
                              background: `${gradeColor}12`,
                              border: `1px solid ${gradeColor}35`,
                              color: gradeColor,
                              fontWeight: 900, fontSize: "0.75rem",
                            }}>
                              {grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Recent carbon transactions */}
            {transactions.length > 0 && (
              <div className="game-panel" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
                <div className="section-title" style={{ color: "#16a34a" }}>
                  <span>🌿</span> Recent Carbon Transactions
                  <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(22,163,74,0.3),transparent)" }} />
                </div>
                <table className="game-table">
                  <thead>
                    <tr><th>Department</th><th>Source</th><th>CO₂ (kg)</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{deptName(t.department_id)}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{t.source_type}</td>
                        <td style={{ fontFamily: "'Orbitron',sans-serif", color: "#16a34a", fontWeight: 700 }}>{(t.calculated_co2 || 0).toFixed(2)}</td>
                        <td style={{ color: "var(--text-muted)" }}>{t.date}</td>
                      </tr>
                    ))}
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
