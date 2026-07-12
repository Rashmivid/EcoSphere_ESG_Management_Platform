import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const SEVERITY_CONFIG = {
  low:      { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)",  color: "#3b82f6",  label: "LOW",      icon: "🔵" },
  medium:   { bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.3)",  color: "#f97316",  label: "MEDIUM",   icon: "🟠" },
  high:     { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   color: "#ef4444",  label: "HIGH",     icon: "🔴" },
  critical: { bg: "rgba(168,85,247,0.15)",  border: "rgba(168,85,247,0.4)",  color: "#a855f7",  label: "CRITICAL", icon: "💀" },
};

const STATUS_CONFIG = {
  open:        { color: "#f97316", label: "OPEN" },
  in_progress: { color: "#3b82f6", label: "IN PROGRESS" },
  resolved:    { color: "#22c55e", label: "RESOLVED" },
  closed:      { color: "rgba(255,255,255,0.3)", label: "CLOSED" },
};

export default function Governance() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [issues, setIssues] = useState([]);
  const [dash, setDash] = useState(null);
  const [acknowledging, setAcknowledging] = useState(null);
  const [toast, setToast] = useState(null);

  const load = async () => {
    const [p, i, d] = await Promise.all([
      api.get("/governance/policies"),
      api.get("/governance/compliance-issues"),
      api.get("/governance/dashboard"),
    ]);
    setPolicies(p.data);
    setIssues(i.data);
    setDash(d.data);
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const acknowledge = async (id) => {
    setAcknowledging(id);
    try {
      await api.post(`/governance/policies/${id}/acknowledge`);
      showToast("✅ Policy acknowledged! Compliance score updated.");
    } catch (e) {
      showToast(e.response?.data?.detail || "Failed to acknowledge", "error");
    } finally { setAcknowledging(null); }
  };

  const stats = [
    { label: "Open Issues",   value: dash?.open_issues ?? "—",   color: "#f97316", icon: "⚠",  shadow: "rgba(249,115,22,0.3)" },
    { label: "Overdue",       value: dash?.overdue_issues ?? "—", color: "#ef4444", icon: "🔴", shadow: "rgba(239,68,68,0.3)" },
    { label: "Policies",      value: policies.length,            color: "#ffd700", icon: "📜", shadow: "rgba(255,215,0,0.3)" },
    { label: "Total Issues",  value: issues.length,              color: "#a855f7", icon: "📋", shadow: "rgba(168,85,247,0.3)" },
  ];

  return (
    <Layout>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(0,255,224,0.12)",
          border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(0,255,224,0.4)"}`,
          color: toast.type === "error" ? "#ef4444" : "#00ffe0",
          padding: "0.75rem 1.25rem", borderRadius: 8,
          fontFamily: "'Orbitron',sans-serif", fontSize: "0.75rem",
          letterSpacing: "0.05em", animation: "fadeUp 0.3s ease-out",
        }}>
          {toast.msg}
        </div>
      )}

      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.65rem", color: "rgba(255,215,0,0.6)", letterSpacing: "0.2em", marginBottom: 4 }}>
            ▶ COMPLIANCE MODULE
          </div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "#fff", margin: 0 }}>
            ⚖️ <span style={{ color: "#ffd700", textShadow: "0 0 15px rgba(255,215,0,0.6)" }}>Governance</span> Control
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card" style={{ borderColor: `rgba(255,215,0,0.1)` }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "2rem", fontWeight: 900, color: s.color, textShadow: `0 0 12px ${s.shadow}` }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Severity breakdown */}
        {dash?.issues_by_severity && (
          <div className="game-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
            <div className="section-title" style={{ color: "rgba(255,215,0,0.7)" }}>
              <span>⚠</span> Issues by Severity
              <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(255,215,0,0.3),transparent)" }} />
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {Object.entries(dash.issues_by_severity).map(([sev, count]) => {
                const sc = SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.low;
                return (
                  <div key={sev} style={{
                    padding: "0.75rem 1.25rem",
                    background: sc.bg, border: `1px solid ${sc.border}`,
                    borderRadius: 8, textAlign: "center", minWidth: 100,
                  }}>
                    <div style={{ fontSize: "1rem", marginBottom: 2 }}>{sc.icon}</div>
                    <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.5rem", fontWeight: 900, color: sc.color }}>{count}</div>
                    <div style={{ fontSize: "0.6rem", color: sc.color, fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em" }}>{sc.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Policies */}
          <div className="game-panel game-panel-gold" style={{ padding: "1.5rem" }}>
            <div className="section-title" style={{ color: "rgba(255,215,0,0.7)" }}>
              <span style={{ color: "#ffd700" }}>📜</span> ESG Policies
              <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(255,215,0,0.3),transparent)" }} />
            </div>
            {policies.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(255,215,0,0.3)", fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem", padding: "2rem" }}>
                NO POLICIES CONFIGURED
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {policies.map(p => (
                  <div key={p.id} className="quest-card quest-card-gold" style={{ cursor: "default" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>
                          {p.title}{" "}
                          <span style={{ fontSize: "0.65rem", color: "rgba(255,215,0,0.5)", fontFamily: "'Orbitron',sans-serif" }}>v{p.version}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                          Effective: {p.effective_date}
                        </div>
                        {p.category && (
                          <div style={{ marginTop: 4 }}>
                            <span className="game-badge" style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", color: "#ffd700" }}>
                              {p.category}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => acknowledge(p.id)}
                        disabled={acknowledging === p.id}
                        className="game-btn game-btn-gold"
                        style={{ fontSize: "0.6rem", opacity: acknowledging === p.id ? 0.5 : 1 }}
                      >
                        {acknowledging === p.id ? "◌" : "✓ ACK"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compliance Issues */}
          <div className="game-panel" style={{ padding: "1.5rem" }}>
            <div className="section-title" style={{ color: "rgba(239,68,68,0.7)" }}>
              <span style={{ color: "#ef4444" }}>🔴</span> Compliance Issues
              <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(239,68,68,0.3),transparent)" }} />
            </div>
            {issues.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(34,197,94,0.4)", fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem", padding: "2rem" }}>
                ✅ ALL CLEAR — NO ISSUES
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: 420, overflowY: "auto" }}>
                {issues.map(issue => {
                  const sc = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.low;
                  const stc = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;
                  const isOverdue = issue.due_date && new Date(issue.due_date) < new Date();
                  return (
                    <div key={issue.id} style={{
                      padding: "0.9rem 1rem",
                      background: sc.bg,
                      border: `1px solid ${sc.border}`,
                      borderLeft: `3px solid ${sc.color}`,
                      borderRadius: 8,
                      transition: "all 0.2s",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.85rem", flex: 1, marginRight: 8 }}>
                          {issue.description}
                        </div>
                        <span className="game-badge" style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, flexShrink: 0 }}>
                          {sc.icon} {sc.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", fontFamily: "'Orbitron',sans-serif" }}>
                          Owner #{issue.owner_id}
                        </span>
                        <span style={{ fontSize: "0.65rem", color: isOverdue ? "#ef4444" : "rgba(255,255,255,0.35)", fontFamily: "'Orbitron',sans-serif" }}>
                          {isOverdue ? "⏰ OVERDUE:" : "📅"} {issue.due_date}
                        </span>
                        <span style={{ fontSize: "0.65rem", fontFamily: "'Orbitron',sans-serif", color: stc.color, fontWeight: 700 }}>
                          ● {stc.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
