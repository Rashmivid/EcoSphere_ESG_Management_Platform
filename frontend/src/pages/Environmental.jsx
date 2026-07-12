import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";

export default function Environmental() {
  const [factors, setFactors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [txForm, setTxForm] = useState({ department_id: "", source_type: "expense", emission_factor_id: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    const [f, t, g, d] = await Promise.all([
      api.get("/environmental/emission-factors"),
      api.get("/environmental/carbon-transactions"),
      api.get("/environmental/goals"),
      api.get("/org/departments"),
    ]);
    setFactors(f.data);
    setTransactions(t.data);
    setGoals(g.data);
    setDepartments(d.data);
  };

  useEffect(() => { load(); }, []);

  const deptName = (id) => departments.find(d => d.id === id)?.name || id;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const submitTx = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/environmental/carbon-transactions", {
        department_id: Number(txForm.department_id),
        source_type: txForm.source_type,
        emission_factor_id: Number(txForm.emission_factor_id),
        amount: Number(txForm.amount),
      });
      setTxForm({ department_id: "", source_type: "expense", emission_factor_id: "", amount: "" });
      showToast("🌿 Carbon transaction logged! +XP incoming.");
      load();
    } catch (e) {
      showToast(e.response?.data?.detail || "Failed to log transaction", "error");
    } finally { setSubmitting(false); }
  };

  const totalCO2 = transactions.reduce((sum, t) => sum + (t.calculated_co2 || 0), 0);

  const sourceIcons = { purchase: "🛒", manufacturing: "🏭", expense: "💳", fleet: "🚗" };

  return (
    <Layout>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.12)",
          border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
          color: toast.type === "error" ? "#ef4444" : "#22c55e",
          padding: "0.75rem 1.25rem", borderRadius: 8,
          fontFamily: "'Orbitron',sans-serif", fontSize: "0.75rem",
          letterSpacing: "0.05em", animation: "fadeUp 0.3s ease-out", maxWidth: 360,
        }}>
          {toast.msg}
        </div>
      )}

      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.65rem", color: "rgba(34,197,94,0.6)", letterSpacing: "0.2em", marginBottom: 4 }}>
            ▶ PLANET MODULE
          </div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "#fff", margin: 0 }}>
            🌿 <span style={{ color: "#22c55e", textShadow: "0 0 15px rgba(34,197,94,0.6)" }}>Environmental</span> Tracker
          </h1>
        </div>

        {/* Summary stat */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total CO₂ Logged", value: `${totalCO2.toFixed(1)} kg`, icon: "🌍", color: "#22c55e" },
            { label: "Transactions", value: transactions.length, icon: "📋", color: "#00ffe0" },
            { label: "Active Goals", value: goals.length, icon: "🎯", color: "#a855f7" },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ borderColor: `rgba(34,197,94,0.15)` }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.5rem", fontWeight: 900, color: s.color, textShadow: `0 0 10px ${s.color}66` }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* Log transaction form */}
          <div className="game-panel" style={{ padding: "1.5rem" }}>
            <div className="section-title" style={{ color: "rgba(34,197,94,0.7)" }}>
              <span style={{ color: "#22c55e" }}>📝</span> Log Carbon Transaction
              <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(34,197,94,0.3), transparent)" }} />
            </div>
            <form onSubmit={submitTx} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.6rem", color: "rgba(34,197,94,0.6)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>DEPARTMENT</label>
                <select className="game-input" value={txForm.department_id} onChange={e => setTxForm({ ...txForm, department_id: e.target.value })} required>
                  <option value="">Select department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.6rem", color: "rgba(34,197,94,0.6)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>SOURCE TYPE</label>
                <select className="game-input" value={txForm.source_type} onChange={e => setTxForm({ ...txForm, source_type: e.target.value })}>
                  <option value="purchase">🛒 Purchase</option>
                  <option value="manufacturing">🏭 Manufacturing</option>
                  <option value="expense">💳 Expense</option>
                  <option value="fleet">🚗 Fleet</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.6rem", color: "rgba(34,197,94,0.6)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>EMISSION FACTOR</label>
                <select className="game-input" value={txForm.emission_factor_id} onChange={e => setTxForm({ ...txForm, emission_factor_id: e.target.value })} required>
                  <option value="">Select factor...</option>
                  {factors.map(f => <option key={f.id} value={f.id}>{f.source_type} — {f.co2_per_unit} kg CO₂/{f.unit}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.6rem", color: "rgba(34,197,94,0.6)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>AMOUNT (UNITS)</label>
                <input type="number" step="any" placeholder="0.00" className="game-input"
                  value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} required />
              </div>
              <button type="submit" disabled={submitting} className="game-btn" style={{ opacity: submitting ? 0.6 : 1, marginTop: 4 }}>
                {submitting ? "◌ LOGGING..." : "🌿 LOG TRANSACTION"}
              </button>
            </form>
          </div>

          {/* Goals */}
          <div className="game-panel" style={{ padding: "1.5rem" }}>
            <div className="section-title" style={{ color: "rgba(168,85,247,0.7)" }}>
              <span style={{ color: "#a855f7" }}>🎯</span> Sustainability Goals
              <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(168,85,247,0.3), transparent)" }} />
            </div>
            {goals.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(168,85,247,0.3)", fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem", padding: "2rem" }}>
                NO GOALS SET YET
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {goals.map(g => {
                  const pct = Math.min((g.current_value / g.target_value) * 100, 100);
                  const isComplete = pct >= 100;
                  return (
                    <div key={g.id} style={{
                      padding: "0.75rem 1rem",
                      background: isComplete ? "rgba(34,197,94,0.07)" : "rgba(168,85,247,0.05)",
                      border: `1px solid ${isComplete ? "rgba(34,197,94,0.2)" : "rgba(168,85,247,0.15)"}`,
                      borderRadius: 8,
                      transition: "all 0.3s",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.85rem" }}>
                          {isComplete && <span style={{ marginRight: 4 }}>✅</span>}
                          {g.metric}
                        </div>
                        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.65rem", color: isComplete ? "#22c55e" : "#a855f7" }}>
                          {pct.toFixed(0)}%
                        </div>
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                        {deptName(g.department_id)} {g.deadline ? `· due ${g.deadline}` : ""}
                      </div>
                      <div style={{ height: 8, background: "rgba(0,0,0,0.3)", borderRadius: 4, overflow: "hidden", border: "1px solid rgba(168,85,247,0.1)" }}>
                        <div style={{
                          height: "100%", borderRadius: 4,
                          width: `${pct}%`,
                          background: isComplete
                            ? "linear-gradient(90deg, #22c55e, #00ffe0)"
                            : "linear-gradient(90deg, #a855f7, #7c3aed)",
                          boxShadow: `0 0 8px ${isComplete ? "rgba(34,197,94,0.6)" : "rgba(168,85,247,0.6)"}`,
                          transition: "width 1s ease-out",
                        }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", fontFamily: "'Orbitron',sans-serif" }}>
                        <span>{g.current_value}</span>
                        <span>TARGET: {g.target_value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Transactions table */}
        <div className="game-panel" style={{ padding: "1.5rem" }}>
          <div className="section-title" style={{ color: "rgba(0,255,224,0.7)" }}>
            <span style={{ color: "#00ffe0" }}>📋</span> Carbon Transaction Log
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(0,255,224,0.3), transparent)" }} />
          </div>
          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(0,255,224,0.3)", fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem", padding: "2rem" }}>
              NO TRANSACTIONS LOGGED YET
            </div>
          ) : (
            <table className="game-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Source</th>
                  <th>CO₂ (kg)</th>
                  <th>Date</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => {
                  const co2 = t.calculated_co2 || 0;
                  const impact = co2 > 100 ? "HIGH" : co2 > 30 ? "MED" : "LOW";
                  const impactColor = co2 > 100 ? "#ef4444" : co2 > 30 ? "#f97316" : "#22c55e";
                  return (
                    <tr key={t.id}>
                      <td style={{ color: "#fff", fontWeight: 500 }}>{deptName(t.department_id)}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {sourceIcons[t.source_type] || "⬡"} {t.source_type}
                        </span>
                      </td>
                      <td style={{ fontFamily: "'Orbitron',sans-serif", color: "#00ffe0", fontWeight: 700 }}>
                        {co2.toFixed(2)}
                      </td>
                      <td style={{ color: "rgba(255,255,255,0.4)" }}>{t.date}</td>
                      <td>
                        <span className="game-badge" style={{ background: `${impactColor}18`, color: impactColor, border: `1px solid ${impactColor}40` }}>
                          {impact}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
