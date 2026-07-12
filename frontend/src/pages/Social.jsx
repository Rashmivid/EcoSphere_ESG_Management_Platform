import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Social() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const isManager = user?.role === "admin" || user?.role === "department_head";

  const load = async () => {
    const [a, p] = await Promise.all([
      api.get("/social/activities"),
      api.get("/social/participations/mine"),
    ]);
    setActivities(a.data);
    setMyParticipations(p.data);
  };

  useEffect(() => { load(); }, []);

  const join = async (activityId) => {
    await api.post("/social/participations", { activity_id: activityId });
    load();
  };

  const submitProof = async (pId) => {
    const url = prompt("Paste a proof URL (e.g. photo link):");
    if (!url) return;
    await api.put(`/social/participations/${pId}/proof`, { proof_url: url });
    load();
  };

  const myStatusFor = (activityId) => myParticipations.find(p => p.activity_id === activityId);

  const statusConfig = {
    approved: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", color: "#22c55e", label: "✅ APPROVED" },
    rejected: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", color: "#ef4444", label: "❌ REJECTED" },
    pending:  { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)", color: "#f97316", label: "⏳ PENDING" },
  };

  return (
    <Layout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.65rem", color: "rgba(59,130,246,0.6)", letterSpacing: "0.2em", marginBottom: 4 }}>
            ▶ COMMUNITY MODULE
          </div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "#fff", margin: 0 }}>
            🤝 <span style={{ color: "#3b82f6", textShadow: "0 0 15px rgba(59,130,246,0.6)" }}>Social</span> — CSR Missions
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Missions", value: activities.length, icon: "🌐", color: "#3b82f6" },
            { label: "Joined",  value: myParticipations.length, icon: "⚡", color: "#00ffe0" },
            { label: "Approved", value: myParticipations.filter(p => p.approval_status === "approved").length, icon: "✅", color: "#22c55e" },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ borderColor: "rgba(59,130,246,0.15)" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "2rem", fontWeight: 900, color: s.color, textShadow: `0 0 10px ${s.color}66` }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Activity Cards */}
        <div className="section-title" style={{ color: "rgba(59,130,246,0.7)" }}>
          <span style={{ color: "#3b82f6" }}>🌐</span> Available Missions
          <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(59,130,246,0.3), transparent)" }} />
        </div>

        {activities.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(59,130,246,0.3)", fontFamily: "'Orbitron',sans-serif", fontSize: "0.75rem", padding: "3rem" }}>
            NO CSR MISSIONS AVAILABLE
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {activities.map((a) => {
              const mine = myStatusFor(a.id);
              const sc = mine ? statusConfig[mine.approval_status] || statusConfig.pending : null;
              return (
                <div key={a.id} style={{
                  background: "linear-gradient(135deg, rgba(17,24,39,0.95), rgba(10,14,26,0.98))",
                  border: "1px solid rgba(59,130,246,0.15)",
                  borderLeft: "3px solid #3b82f6",
                  borderRadius: 10,
                  padding: "1.25rem",
                  transition: "all 0.3s",
                  position: "relative",
                  overflow: "hidden",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                    e.currentTarget.style.boxShadow = "-4px 0 16px rgba(59,130,246,0.2), 0 4px 16px rgba(0,0,0,0.4)";
                    e.currentTarget.style.transform = "translateX(3px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <h3 style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", marginBottom: 4 }}>{a.title}</h3>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{a.description}</p>
                  {a.date && <p style={{ fontSize: "0.7rem", color: "rgba(59,130,246,0.5)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.05em" }}>📅 {a.date}</p>}

                  <div style={{ marginTop: "1rem" }}>
                    {!mine && (
                      <button onClick={() => join(a.id)} className="game-btn" style={{ background: "rgba(59,130,246,0.15)", borderColor: "rgba(59,130,246,0.4)", color: "#3b82f6" }}>
                        ⚡ JOIN MISSION
                      </button>
                    )}
                    {mine && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span className="game-badge" style={{ background: sc?.bg, border: `1px solid ${sc?.border}`, color: sc?.color }}>
                          {sc?.label}
                        </span>
                        {mine.approval_status === "pending" && !mine.proof_url && (
                          <button onClick={() => submitProof(mine.id)} className="game-btn" style={{ fontSize: "0.65rem", padding: "3px 8px" }}>
                            📎 PROOF
                          </button>
                        )}
                        {mine.points_earned > 0 && (
                          <span style={{ fontSize: "0.7rem", color: "#ffd700", fontFamily: "'Orbitron',sans-serif" }}>+{mine.points_earned} XP</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isManager && <ManagerApprovals />}
      </div>
    </Layout>
  );
}

function ManagerApprovals() {
  const [pending, setPending] = useState([]);
  const [deciding, setDeciding] = useState(null);
  const [toast, setToast] = useState(null);

  const load = async () => {
    const res = await api.get("/social/participations", { params: { status: "pending" } });
    setPending(res.data);
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const decide = async (id, approve) => {
    setDeciding(id);
    try {
      await api.put(`/social/participations/${id}/decision`, { approve });
      showToast(approve ? "✅ Participation approved!" : "❌ Participation rejected.");
      load();
    } catch (e) {
      showToast(e.response?.data?.detail || "Action failed", "error");
    } finally { setDeciding(null); }
  };

  return (
    <div className="game-panel" style={{ padding: "1.5rem", marginTop: "1.5rem", borderColor: "rgba(249,115,22,0.2)" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.12)",
          border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
          color: toast.type === "error" ? "#ef4444" : "#22c55e",
          padding: "0.75rem 1.25rem", borderRadius: 8,
          fontFamily: "'Orbitron',sans-serif", fontSize: "0.75rem",
          animation: "fadeUp 0.3s ease-out",
        }}>
          {toast.msg}
        </div>
      )}
      <div className="section-title" style={{ color: "rgba(249,115,22,0.7)" }}>
        <span style={{ color: "#f97316" }}>⚙</span> Manager — Pending Approvals
        <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(249,115,22,0.3), transparent)" }} />
      </div>
      {pending.length === 0 ? (
        <div style={{ textAlign: "center", color: "rgba(249,115,22,0.3)", fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem", padding: "1.5rem" }}>
          ALL CLEAR — NOTHING PENDING
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {pending.map(p => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.75rem 1rem",
              background: "rgba(249,115,22,0.05)",
              border: "1px solid rgba(249,115,22,0.15)",
              borderRadius: 8,
            }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#e2e8f0" }}>
                  Employee #{p.employee_id} · Activity #{p.activity_id}
                </span>
                <span style={{ marginLeft: 8 }}>
                  {p.proof_url
                    ? <a href={p.proof_url} target="_blank" rel="noreferrer" style={{ color: "#00ffe0", fontSize: "0.75rem" }}>📎 proof</a>
                    : <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>⚠ no proof</span>
                  }
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => decide(p.id, true)} disabled={deciding === p.id} className="game-btn" style={{ opacity: deciding === p.id ? 0.5 : 1 }}>✅ APPROVE</button>
                <button onClick={() => decide(p.id, false)} disabled={deciding === p.id} className="game-btn game-btn-danger" style={{ opacity: deciding === p.id ? 0.5 : 1 }}>❌ REJECT</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
