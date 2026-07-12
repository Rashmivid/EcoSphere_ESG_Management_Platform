import { useState, useEffect } from "react";
import api from "../api/client";
import Layout from "../components/Layout";

const REPORTS = [
  { key: "environmental", label: "Environmental", icon: "🌿", color: "#22c55e", shadow: "rgba(34,197,94,0.3)" },
  { key: "social",        label: "Social",        icon: "🤝", color: "#3b82f6", shadow: "rgba(59,130,246,0.3)" },
  { key: "governance",    label: "Governance",    icon: "⚖️", color: "#ffd700", shadow: "rgba(255,215,0,0.3)" },
  { key: "esg-summary",  label: "ESG Summary",   icon: "⬡",  color: "#00ffe0", shadow: "rgba(0,255,224,0.3)" },
];

function flattenToRows(data) {
  if (!data || typeof data !== "object") return [];
  // Check if it has department_scores array → pivot into rows
  if (data.department_scores && Array.isArray(data.department_scores)) {
    return data.department_scores.map(s => ({
      _meta: { period: data.period, overall: data.overall_score },
      ...s,
    }));
  }
  // Array of objects
  if (Array.isArray(data)) return data;
  // Single flat object
  return [data];
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card" style={{ borderColor: `${color}22` }}>
      <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.6rem", fontWeight: 900, color, textShadow: `0 0 12px ${color}66` }}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function ReportSummary({ reportKey, data }) {
  if (!data) return null;

  // ESG Summary view
  if (reportKey === "esg-summary" && data.department_scores) {
    const rows = data.department_scores;
    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          <StatCard label="Overall Score" value={data.overall_score} color="#00ffe0" icon="⬡" />
          <StatCard label="Period" value={data.period} color="#a855f7" icon="📅" />
          <StatCard label="Departments" value={rows.length} color="#ffd700" icon="🏛" />
        </div>
        <table className="game-table">
          <thead>
            <tr>
              <th>Dept ID</th>
              <th>Environmental</th>
              <th>Social</th>
              <th>Governance</th>
              <th>Total</th>
              <th>Computed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ color: "#fff", fontWeight: 600 }}>#{r.department_id}</td>
                <td><span style={{ color: "#22c55e", fontFamily: "'Orbitron',sans-serif", fontSize: "0.8rem" }}>{r.environmental_score}</span></td>
                <td><span style={{ color: "#3b82f6", fontFamily: "'Orbitron',sans-serif", fontSize: "0.8rem" }}>{r.social_score}</span></td>
                <td><span style={{ color: "#ffd700", fontFamily: "'Orbitron',sans-serif", fontSize: "0.8rem" }}>{r.governance_score}</span></td>
                <td style={{ fontFamily: "'Orbitron',sans-serif", color: "#00ffe0", fontWeight: 700 }}>{r.total_score}</td>
                <td style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem" }}>{r.computed_at ? new Date(r.computed_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  // Environmental report
  if (reportKey === "environmental") {
    return (
      <>
        {data.totals && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            <StatCard label="Total CO₂ (kg)" value={data.totals.total_co2?.toFixed(2)} color="#22c55e" icon="🌍" />
            <StatCard label="Transactions" value={data.totals.transaction_count} color="#00ffe0" icon="📋" />
            <StatCard label="Goals" value={data.totals.goal_count} color="#a855f7" icon="🎯" />
          </div>
        )}
        {data.by_source && (
          <>
            <div className="section-title" style={{ color: "rgba(34,197,94,0.7)" }}>
              <span>🌿</span> Emissions by Source
              <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(34,197,94,0.3),transparent)" }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {Object.entries(data.by_source).map(([src, val]) => (
                <div key={src} style={{
                  padding: "0.75rem 1.25rem",
                  background: "rgba(34,197,94,0.07)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: "0.6rem", color: "rgba(34,197,94,0.6)", fontFamily: "'Orbitron',sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>{src}</div>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", color: "#22c55e", fontWeight: 700, marginTop: 2 }}>{typeof val === "number" ? val.toFixed(2) : JSON.stringify(val)}</div>
                </div>
              ))}
            </div>
          </>
        )}
        <RawJSON data={data} />
      </>
    );
  }

  // Social report
  if (reportKey === "social") {
    return (
      <>
        {data.totals && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            <StatCard label="Activities" value={data.totals.activity_count} color="#3b82f6" icon="🌐" />
            <StatCard label="Participations" value={data.totals.participation_count} color="#00ffe0" icon="⚡" />
            <StatCard label="Approved" value={data.totals.approved_count} color="#22c55e" icon="✅" />
          </div>
        )}
        <RawJSON data={data} />
      </>
    );
  }

  // Governance report
  if (reportKey === "governance") {
    return (
      <>
        {data.totals && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            <StatCard label="Total Issues" value={data.totals.issue_count} color="#ffd700" icon="⚠" />
            <StatCard label="Open Issues" value={data.totals.open_count} color="#f97316" icon="🔴" />
            <StatCard label="Policies" value={data.totals.policy_count} color="#a855f7" icon="📜" />
          </div>
        )}
        <RawJSON data={data} />
      </>
    );
  }

  return <RawJSON data={data} />;
}

function RawJSON({ data }) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div>
      <button
        onClick={() => setCollapsed(c => !c)}
        className="game-btn"
        style={{ marginBottom: "0.75rem", fontSize: "0.65rem" }}
      >
        {collapsed ? "▶ SHOW RAW JSON" : "▼ HIDE RAW JSON"}
      </button>
      {!collapsed && (
        <pre style={{
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(0,255,224,0.15)",
          borderRadius: 8,
          padding: "1.25rem",
          fontSize: "0.75rem",
          color: "#00ffe0",
          overflowX: "auto",
          maxHeight: "60vh",
          lineHeight: 1.6,
          fontFamily: "'Courier New', monospace",
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function Reports() {
  const [active, setActive] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadedLabel, setLoadedLabel] = useState("");

  const run = async (r) => {
    setActive(r.key);
    setLoadedLabel(r.label);
    setData(null);
    setLoading(true);
    try {
      const res = await api.get(`/reports/${r.key}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeReport = REPORTS.find(r => r.key === active);

  return (
    <Layout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.65rem", color: "rgba(0,255,224,0.5)", letterSpacing: "0.2em", marginBottom: 4 }}>
            ▶ INTELLIGENCE MODULE
          </div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "#fff", margin: 0 }}>
            📊 <span style={{ color: "#00ffe0", textShadow: "0 0 15px rgba(0,255,224,0.6)" }}>Intel</span> Reports
          </h1>
        </div>

        {/* Report selector */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {REPORTS.map((r) => (
            <button
              key={r.key}
              onClick={() => run(r)}
              style={{
                background: active === r.key
                  ? `linear-gradient(135deg, ${r.color}22, ${r.color}11)`
                  : "linear-gradient(135deg, rgba(17,24,39,0.95), rgba(10,14,26,0.98))",
                border: `1px solid ${active === r.key ? r.color + "60" : "rgba(0,255,224,0.1)"}`,
                borderRadius: 10,
                padding: "1.25rem 1rem",
                cursor: "pointer",
                transition: "all 0.3s",
                textAlign: "center",
                boxShadow: active === r.key ? `0 0 20px ${r.shadow}` : "none",
                transform: active === r.key ? "translateY(-3px)" : "none",
              }}
              onMouseEnter={e => {
                if (active !== r.key) {
                  e.currentTarget.style.borderColor = `${r.color}40`;
                  e.currentTarget.style.background = `linear-gradient(135deg, ${r.color}10, rgba(10,14,26,0.98))`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={e => {
                if (active !== r.key) {
                  e.currentTarget.style.borderColor = "rgba(0,255,224,0.1)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(17,24,39,0.95), rgba(10,14,26,0.98))";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 6 }}>{r.icon}</div>
              <div style={{
                fontFamily: "'Orbitron',sans-serif", fontSize: "0.65rem", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: active === r.key ? r.color : "rgba(255,255,255,0.5)",
                textShadow: active === r.key ? `0 0 10px ${r.color}` : "none",
              }}>
                {r.label}
              </div>
              {active === r.key && (
                <div style={{
                  marginTop: 6, width: 24, height: 2,
                  background: r.color,
                  boxShadow: `0 0 8px ${r.color}`,
                  borderRadius: 1,
                  margin: "6px auto 0",
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Report panel */}
        <div className="game-panel" style={{ padding: "1.75rem" }}>
          {/* Panel header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              {active ? (
                <>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.6rem", color: "rgba(0,255,224,0.4)", letterSpacing: "0.15em", marginBottom: 4 }}>
                    ACTIVE REPORT
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.2rem" }}>{activeReport?.icon}</span>
                    <span style={{
                      fontFamily: "'Orbitron',sans-serif", fontSize: "1rem", fontWeight: 700,
                      color: activeReport?.color || "#00ffe0",
                      textShadow: `0 0 10px ${activeReport?.shadow || "rgba(0,255,224,0.4)"}`,
                    }}>
                      {loadedLabel} Report
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.8rem", color: "rgba(0,255,224,0.3)", letterSpacing: "0.1em" }}>
                  SELECT A REPORT ABOVE TO GENERATE INTEL
                </div>
              )}
            </div>
            {data && (
              <button onClick={downloadJson} className="game-btn" style={{ fontSize: "0.65rem" }}>
                💾 EXPORT JSON
              </button>
            )}
          </div>

          {/* States */}
          {!active && !loading && (
            <div style={{
              textAlign: "center", padding: "4rem 2rem",
              background: "rgba(0,255,224,0.02)",
              border: "1px dashed rgba(0,255,224,0.1)",
              borderRadius: 10,
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>📊</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.8rem", color: "rgba(0,255,224,0.3)", letterSpacing: "0.15em" }}>
                SELECT A REPORT MODULE TO GENERATE INTEL
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
                Choose from Environmental · Social · Governance · ESG Summary
              </div>
            </div>
          )}

          {loading && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "4rem", gap: "1rem",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                border: "3px solid rgba(0,255,224,0.15)",
                borderTop: "3px solid #00ffe0",
                animation: "spin 1s linear infinite",
              }} />
              <div style={{ fontFamily: "'Orbitron',sans-serif", color: "#00ffe0", fontSize: "0.8rem", letterSpacing: "0.15em" }}>
                GENERATING INTEL...
              </div>
            </div>
          )}

          {!loading && data && (
            <div style={{ animation: "fadeUp 0.4s ease-out" }}>
              {/* Divider */}
              <div style={{ height: 1, background: `linear-gradient(90deg, ${activeReport?.color || "#00ffe0"}40, transparent)`, marginBottom: "1.5rem" }} />
              <ReportSummary reportKey={active} data={data} />
            </div>
          )}
        </div>

        {/* Info note */}
        <div style={{
          marginTop: "1rem", padding: "0.75rem 1rem",
          background: "rgba(0,255,224,0.03)", border: "1px solid rgba(0,255,224,0.08)",
          borderRadius: 8, fontSize: "0.7rem", color: "rgba(255,255,255,0.3)",
        }}>
          💡 Custom reports: <code style={{ color: "rgba(0,255,224,0.5)" }}>GET /reports/custom</code> supports filters for department, date range, module, employee, and challenge.
          PDF/Excel export can be added via reportlab/openpyxl or generated client-side from the exported JSON.
        </div>
      </div>
    </Layout>
  );
}
