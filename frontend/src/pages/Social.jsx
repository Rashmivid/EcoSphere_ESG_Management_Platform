import { useEffect, useState, useRef } from "react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Social() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("missions");
  
  // Missions state
  const [activities, setActivities]     = useState([]);
  const [myParticipations, setMyParts]  = useState([]);
  const [loading, setLoading]           = useState(true);
  const [toast, setToast]               = useState(null);
  const isManager = user?.role === "admin" || user?.role === "department_head";
  
  // File upload state & ref
  const fileInputRef = useRef(null);
  const [selectedPartId, setSelectedPartId] = useState(null);

  // Diversity state
  const [diversityData, setDiversityData] = useState([]);
  const [diversityField, setDiversityField] = useState("gender");
  const [diversityValue, setDiversityValue] = useState("");
  const [divSubmitting, setDivSubmitting] = useState(false);

  // Training state
  const [trainingData, setTrainingData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newTraining, setNewTraining] = useState({ training_name: "", employee_id: "" });
  const [trainSubmitting, setTrainSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [a, p] = await Promise.all([
        api.get("/social/activities"),
        api.get("/social/participations/mine"),
      ]);
      setActivities(a.data || []);
      setMyParts(p.data || []);
      
      // Load diversity metrics
      const divRes = await api.get("/social/diversity-metrics");
      setDiversityData(divRes.data || []);

      // Load training completions
      const trainRes = await api.get("/social/training-completions");
      setTrainingData(trainRes.data || []);

      if (isManager) {
        const empRes = await api.get("/org/employees");
        setEmployees(empRes.data || []);
      }
    } catch (e) {
      console.error("Social load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const join = async (id) => {
    try {
      await api.post("/social/participations", { activity_id: id });
      showToast("⚡ Joined mission successfully!");
      load();
    } catch (e) {
      showToast(e.response?.data?.detail || "Could not join", "error");
    }
  };

  const triggerSubmitProof = (pId) => {
    setSelectedPartId(pId);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result;
      try {
        await api.put(`/social/participations/${selectedPartId}/proof`, { proof_url: base64data });
        showToast("📎 Proof photo uploaded successfully!");
        load();
      } catch (err) {
        showToast(err.response?.data?.detail || "Failed to upload proof", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  const submitDiversity = async (e) => {
    e.preventDefault();
    if (!diversityValue.trim()) return;
    setDivSubmitting(true);
    try {
      await api.post("/social/diversity-metrics", { field: diversityField, value: diversityValue });
      showToast("📊 Diversity metric saved!");
      setDiversityValue("");
      load();
    } catch (e) {
      showToast("Failed to save diversity metric", "error");
    } finally {
      setDivSubmitting(false);
    }
  };

  const assignTraining = async (e) => {
    e.preventDefault();
    if (!newTraining.training_name || !newTraining.employee_id) return;
    setTrainSubmitting(true);
    try {
      await api.post("/social/training-completions", {
        training_name: newTraining.training_name,
        employee_id: Number(newTraining.employee_id)
      });
      showToast("📚 Training assigned!");
      setNewTraining({ training_name: "", employee_id: "" });
      load();
    } catch (e) {
      showToast("Failed to assign training", "error");
    } finally {
      setTrainSubmitting(false);
    }
  };

  const completeTraining = async (tcId) => {
    try {
      await api.put(`/social/training-completions/${tcId}?status=completed`);
      showToast("✅ Training marked as completed!");
      load();
    } catch (e) {
      showToast("Failed to update training", "error");
    }
  };

  const myStatusFor = (activityId) => myParticipations.find(p => p.activity_id === activityId);
  const approvedCount = myParticipations.filter(p => p.approval_status === "approved").length;

  const statusCfg = {
    approved: { bg: "rgba(22,163,74,0.08)", border: "rgba(22,163,74,0.25)", color: "#16a34a", label: "✅ APPROVED" },
    rejected: { bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.25)", color: "#dc2626", label: "❌ REJECTED" },
    pending:  { bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.25)", color: "#d97706", label: "⏳ PENDING" },
  };

  return (
    <Layout>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} accept="image/*" />
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "rgba(220,38,38,0.1)" : "rgba(22,163,74,0.1)",
          border: `1px solid ${toast.type === "error" ? "rgba(220,38,38,0.3)" : "rgba(22,163,74,0.3)"}`,
          color: toast.type === "error" ? "#dc2626" : "#16a34a",
          padding: "0.75rem 1.25rem", borderRadius: 10,
          fontFamily: "'Orbitron',sans-serif", fontSize: "0.75rem",
          animation: "fadeUp 0.3s", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}>
          {toast.msg}
        </div>
      )}

      <div className="page-enter">
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.6rem", color: "#2563eb", letterSpacing: "0.2em", marginBottom: 4, fontWeight: 700 }}>
            ▶ COMMUNITY & SOCIAL RESPONSIBILITY
          </div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
            🤝 <span style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Social</span> Module
          </h1>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
          {[
            { key: "missions", label: "CSR Missions", icon: "🌐" },
            { key: "diversity", label: "Diversity Metrics", icon: "📊" },
            { key: "training", label: "Training Completion", icon: "📚" }
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              fontFamily: "'Orbitron',sans-serif", fontSize: "0.65rem", fontWeight: 700,
              padding: "0.4rem 0.9rem", borderRadius: "6px 6px 0 0", cursor: "pointer",
              background: activeTab === t.key ? "rgba(37,99,235,0.08)" : "transparent",
              border: activeTab === t.key ? "1px solid rgba(37,99,235,0.2)" : "1px solid transparent",
              borderBottom: activeTab === t.key ? "2px solid #2563eb" : "1px solid transparent",
              color: activeTab === t.key ? "#2563eb" : "var(--text-muted)", marginBottom: "-9px", letterSpacing: "0.06em",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, flexDirection: "column", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(37,99,235,0.2)", borderTop: "3px solid #2563eb", animation: "spin 1s linear infinite" }} />
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.75rem", color: "#94a3b8", letterSpacing: "0.15em" }}>LOADING DATA...</div>
          </div>
        ) : (
          <div style={{ animation: "fadeUp 0.3s ease-out" }}>

            {/* TAB: MISSIONS */}
            {activeTab === "missions" && (
              <>
                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
                  {[
                    { label: "Total Missions",  value: activities.length,      icon: "🌐", color: "#2563eb" },
                    { label: "Missions Joined",  value: myParticipations.length, icon: "⚡", color: "#0891b2" },
                    { label: "Approved",         value: approvedCount,          icon: "✅", color: "#16a34a" },
                  ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ fontSize: "0.6rem", color: "#94a3b8", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
                        <div style={{ fontSize: "1.3rem" }}>{s.icon}</div>
                      </div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "2.2rem", fontWeight: 800, color: s.color, lineHeight: 1.2 }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="section-title" style={{ color: "#2563eb" }}>
                  <span>🌐</span> Available Missions ({activities.length})
                  <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(37,99,235,0.3),transparent)" }} />
                </div>

                {activities.length === 0 ? (
                  <div className="game-panel" style={{ padding: "3rem", textAlign: "center", marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>🤝</div>
                    <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.8rem", color: "#94a3b8", letterSpacing: "0.12em", marginBottom: 8 }}>NO CSR MISSIONS AVAILABLE</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Ask your admin to create CSR activities from the Admin panel.</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
                    {activities.map(a => {
                      const mine = myStatusFor(a.id);
                      const sc = mine ? (statusCfg[mine.approval_status] || statusCfg.pending) : null;
                      return (
                        <div key={a.id} className="game-panel" style={{
                          padding: "1.25rem", borderLeft: "3px solid #2563eb",
                          transition: "all 0.3s", cursor: "default",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,99,235,0.12)"; e.currentTarget.style.transform = "translateX(3px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateX(0)"; }}
                        >
                          <h3 style={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem", marginBottom: 6 }}>{a.title}</h3>
                          {a.description && <p style={{ fontSize: "0.82rem", color: "#475569", marginBottom: 6, lineHeight: 1.5 }}>{a.description}</p>}

                          <div style={{ display: "flex", gap: 12, marginBottom: "0.85rem", flexWrap: "wrap" }}>
                            {a.date && (
                              <span style={{ fontSize: "0.72rem", color: "#2563eb", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.04em", fontWeight: 600 }}>
                                📅 {a.date}
                              </span>
                            )}
                            {a.evidence_required && (
                              <span className="game-badge" style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)", color: "#d97706" }}>
                                📎 PROOF NEEDED
                              </span>
                            )}
                          </div>

                          <div style={{ borderTop: "1px solid rgba(99,102,241,0.08)", paddingTop: "0.75rem" }}>
                            {!mine ? (
                              <button onClick={() => join(a.id)} className="game-btn" style={{
                                width: "100%",
                                background: "rgba(37,99,235,0.08)", borderColor: "rgba(37,99,235,0.35)", color: "#2563eb",
                              }}>
                                ⚡ JOIN THIS MISSION
                              </button>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                <span className="game-badge" style={{ background: sc?.bg, border: `1px solid ${sc?.border}`, color: sc?.color, padding: "4px 10px", fontSize: "0.65rem" }}>
                                  {sc?.label}
                                </span>
                                {mine.approval_status === "pending" && !mine.proof_url && (
                                  <button onClick={() => triggerSubmitProof(mine.id)} className="game-btn" style={{ fontSize: "0.6rem", padding: "4px 10px" }}>📎 SUBMIT PROOF</button>
                                )}
                                {mine.proof_url && (
                                  <div style={{ marginTop: 8, width: "100%" }}>
                                    {mine.proof_url.startsWith("data:image") ? (
                                      <div>
                                        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginBottom: 4 }}>📎 Submitted photo:</div>
                                        <img src={mine.proof_url} alt="Proof Preview" style={{ maxWidth: "120px", maxHeight: "90px", borderRadius: 6, border: "1px solid var(--border-subtle)", display: "block" }} />
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: "0.7rem", color: "#16a34a" }}>✓ Proof submitted</span>
                                    )}
                                  </div>
                                )}
                                {mine.points_earned > 0 && (
                                  <span style={{ fontSize: "0.72rem", color: "#d97706", fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>+{mine.points_earned} XP</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Manager Approvals */}
                {isManager && <ManagerApprovals loadMain={load} />}
              </>
            )}

            {/* TAB: DIVERSITY METRICS */}
            {activeTab === "diversity" && (
              <div style={{ display: "grid", gridTemplateColumns: isManager ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>
                {/* Submit Diversity Data */}
                <div className="game-panel" style={{ padding: "1.5rem" }}>
                  <div className="section-title" style={{ color: "#2563eb" }}>
                    <span>📊</span> Self-report Diversity Info
                    <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(37,99,235,0.3),transparent)" }} />
                  </div>
                  <form onSubmit={submitDiversity} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "0.65rem", color: "#2563eb", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.08em", display: "block", marginBottom: 6, fontWeight: 700 }}>METRIC FIELD</label>
                      <select className="game-input" value={diversityField} onChange={e => setDiversityField(e.target.value)}>
                        <option value="gender">Gender Diversity</option>
                        <option value="nationality">Nationality</option>
                        <option value="languages">Languages Spoken</option>
                        <option value="age_group">Age Group</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.65rem", color: "#2563eb", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.08em", display: "block", marginBottom: 6, fontWeight: 700 }}>VALUE</label>
                      <input className="game-input" placeholder="e.g. Female, Spanish, 25-34" value={diversityValue} onChange={e => setDiversityValue(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={divSubmitting} className="game-btn" style={{ background: "rgba(37,99,235,0.08)", borderColor: "rgba(37,99,235,0.35)", color: "#2563eb" }}>
                      {divSubmitting ? "◌ SUBMITTING..." : "📊 SAVE METRIC"}
                    </button>
                  </form>
                </div>

                {/* Diversity Dashboard */}
                <div className="game-panel" style={{ padding: "1.5rem" }}>
                  <div className="section-title" style={{ color: "#0891b2" }}>
                    <span>📈</span> Diversity Records {isManager ? "(All Organization)" : "(My Record)"}
                    <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(8,145,178,0.3),transparent)" }} />
                  </div>
                  {diversityData.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem", padding: "2rem" }}>No diversity records submitted yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: 300, overflowY: "auto" }}>
                      {diversityData.map(d => (
                        <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 1rem", background: "rgba(8,145,178,0.04)", border: "1px solid rgba(8,145,178,0.15)", borderRadius: 10 }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", fontFamily: "'Orbitron',sans-serif", fontWeight: 700, color: "#0891b2", textTransform: "uppercase" }}>{d.field.replace("_", " ")}</span>
                            {isManager && <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginLeft: 8 }}>User #{d.employee_id}</span>}
                          </div>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: TRAINING COMPLETION */}
            {activeTab === "training" && (
              <div style={{ display: "grid", gridTemplateColumns: isManager ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>
                {/* Assign Training (Manager only) */}
                {isManager && (
                  <div className="game-panel" style={{ padding: "1.5rem" }}>
                    <div className="section-title" style={{ color: "#7c3aed" }}>
                      <span>➕</span> Assign Training
                      <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(124,58,237,0.3),transparent)" }} />
                    </div>
                    <form onSubmit={assignTraining} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div>
                        <label style={{ fontSize: "0.65rem", color: "#7c3aed", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.08em", display: "block", marginBottom: 6, fontWeight: 700 }}>TRAINING NAME</label>
                        <input className="game-input" placeholder="e.g. CSR Guidelines 2026, ESG Fundamentals" value={newTraining.training_name} onChange={e => setNewTraining({ ...newTraining, training_name: e.target.value })} required />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.65rem", color: "#7c3aed", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.08em", display: "block", marginBottom: 6, fontWeight: 700 }}>SELECT EMPLOYEE</label>
                        <select className="game-input" value={newTraining.employee_id} onChange={e => setNewTraining({ ...newTraining, employee_id: e.target.value })} required>
                          <option value="">Select user...</option>
                          {employees.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
                        </select>
                      </div>
                      <button type="submit" disabled={trainSubmitting} className="game-btn" style={{ background: "rgba(124,58,237,0.08)", borderColor: "rgba(124,58,237,0.35)", color: "#7c3aed" }}>
                        {trainSubmitting ? "◌ ASSIGNING..." : "📚 ASSIGN TRAINING"}
                      </button>
                    </form>
                  </div>
                )}

                {/* Training completions list */}
                <div className="game-panel" style={{ padding: "1.5rem" }}>
                  <div className="section-title" style={{ color: "#16a34a" }}>
                    <span>📚</span> Training Dashboard
                    <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(22,163,74,0.3),transparent)" }} />
                  </div>
                  {trainingData.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem", padding: "2rem" }}>No training modules assigned.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: 300, overflowY: "auto" }}>
                      {trainingData.map(t => {
                        const isCompleted = t.status === "completed";
                        return (
                          <div key={t.id} style={{
                            padding: "0.85rem 1rem",
                            background: isCompleted ? "rgba(22,163,74,0.04)" : "rgba(217,119,6,0.04)",
                            border: `1px solid ${isCompleted ? "rgba(22,163,74,0.15)" : "rgba(217,119,6,0.15)"}`,
                            borderRadius: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.85rem" }}>{t.training_name}</div>
                              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2 }}>
                                {isManager && `User #${t.employee_id} · `}
                                {isCompleted ? `✅ Completed at ${new Date(t.completed_at).toLocaleDateString()}` : "⏳ Pending Completion"}
                              </div>
                            </div>
                            {!isCompleted && (t.employee_id === user?.id || isManager) && (
                              <button onClick={() => completeTraining(t.id)} className="game-btn" style={{
                                fontSize: "0.6rem", padding: "4px 10px",
                                background: "rgba(22,163,74,0.08)", borderColor: "rgba(22,163,74,0.35)", color: "#16a34a"
                              }}>
                                ✓ COMPLETE
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

/* ── Manager Approvals Panel ── */
function ManagerApprovals({ loadMain }) {
  const [pending, setPending]   = useState([]);
  const [deciding, setDeciding] = useState(null);
  const [toast, setToast]       = useState(null);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/social/participations", { params: { status: "pending" } });
      setPending(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  const decide = async (id, approve) => {
    setDeciding(id);
    try {
      await api.put(`/social/participations/${id}/decision`, { approve });
      showToast(approve ? "✅ Participation approved!" : "❌ Participation rejected.");
      load();
      if (loadMain) loadMain();
    } catch (e) {
      showToast(e.response?.data?.detail || "Failed", "error");
    } finally {
      setDeciding(null);
    }
  };

  return (
    <div className="game-panel game-panel-gold" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "rgba(220,38,38,0.1)" : "rgba(22,163,74,0.1)",
          border: `1px solid ${toast.type === "error" ? "rgba(220,38,38,0.3)" : "rgba(22,163,74,0.3)"}`,
          color: toast.type === "error" ? "#dc2626" : "#16a34a",
          padding: "0.75rem 1.25rem", borderRadius: 10,
          fontFamily: "'Orbitron',sans-serif", fontSize: "0.75rem",
          animation: "fadeUp 0.3s", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}>
          {toast.msg}
        </div>
      )}

      <div className="section-title" style={{ color: "#d97706" }}>
        <span>⚙️</span> Manager — Pending Approvals ({pending.length})
        <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(217,119,6,0.3),transparent)" }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8", fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem" }}>Loading...</div>
      ) : pending.length === 0 ? (
        <div style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8, opacity: 0.4 }}>✅</div>
          <div style={{ color: "#16a34a", fontFamily: "'Orbitron',sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em" }}>ALL CLEAR — NOTHING PENDING</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {pending.map(p => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.85rem 1rem", background: "rgba(217,119,6,0.04)",
              border: "1px solid rgba(217,119,6,0.15)", borderRadius: 10,
              flexWrap: "wrap", gap: 8,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>Employee #{p.employee_id}</span>
                  <span style={{ fontSize: "0.75rem", color: "#475569" }}>· Activity #{p.activity_id}</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  {p.proof_url ? (
                    p.proof_url.startsWith("data:image") ? (
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>📎 Uploaded Photo Evidence:</div>
                        <img src={p.proof_url} alt="Proof Upload" style={{ maxWidth: "240px", maxHeight: "180px", borderRadius: 8, border: "1.5px dashed rgba(217,119,6,0.3)", display: "block" }} />
                      </div>
                    ) : (
                      <a href={p.proof_url} target="_blank" rel="noreferrer" style={{ color: "#0891b2", fontSize: "0.75rem", textDecoration: "none" }}>📎 View proof link</a>
                    )
                  ) : (
                    <span style={{ color: "#dc2626", fontSize: "0.75rem" }}>⚠ No proof submitted</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => decide(p.id, true)} disabled={deciding === p.id} className="game-btn" style={{ fontSize: "0.6rem", opacity: deciding === p.id ? 0.5 : 1 }}>
                  ✅ APPROVE
                </button>
                <button onClick={() => decide(p.id, false)} disabled={deciding === p.id} className="game-btn game-btn-danger" style={{ fontSize: "0.6rem", opacity: deciding === p.id ? 0.5 : 1 }}>
                  ❌ REJECT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
