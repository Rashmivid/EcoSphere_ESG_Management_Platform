import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Environmental() {
  const { user } = useAuth();
  const isManager = user?.role === "admin" || user?.role === "department_head";
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("tracking");
  const [factors, setFactors]           = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals]               = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [toast, setToast]               = useState(null);
  const [loading, setLoading]           = useState(true);

  // Forms
  const [txForm, setTxForm] = useState({ department_id:"", source_type:"expense", emission_factor_id:"", amount:"" });
  const [goalForm, setGoalForm] = useState({ department_id: "", metric: "", target_value: "", deadline: "" });
  const [factorForm, setFactorForm] = useState({ source_type: "expense", unit: "", co2_per_unit: "" });
  const [erpForm, setErpForm] = useState({ department_id: "", source_type: "expense", amount: "", source_record_id: "" });
  
  const [submitting, setSubmitting] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [f, t, g, d] = await Promise.all([
        api.get("/environmental/emission-factors"),
        api.get("/environmental/carbon-transactions"),
        api.get("/environmental/goals"),
        api.get("/org/departments"),
      ]);
      setFactors(f.data || []);
      setTransactions(t.data || []);
      setGoals(g.data || []);
      setDepartments(d.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deptName = (id) => departments.find(d=>d.id===id)?.name || `Dept #${id}`;
  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const submitTx = async (e) => {
    e.preventDefault(); setSubmitting("tx");
    try {
      await api.post("/environmental/carbon-transactions", {
        department_id: Number(txForm.department_id),
        source_type: txForm.source_type,
        emission_factor_id: Number(txForm.emission_factor_id),
        amount: Number(txForm.amount),
      });
      setTxForm({ department_id:"", source_type:"expense", emission_factor_id:"", amount:"" });
      showToast("🌿 Carbon transaction logged!");
      load();
    } catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
    finally { setSubmitting(""); }
  };

  const createGoal = async (e) => {
    e.preventDefault(); setSubmitting("goal");
    try {
      await api.post("/environmental/goals", {
        department_id: Number(goalForm.department_id),
        metric: goalForm.metric,
        target_value: Number(goalForm.target_value),
        deadline: goalForm.deadline || null
      });
      setGoalForm({ department_id: "", metric: "", target_value: "", deadline: "" });
      showToast("🎯 Sustainability goal created!");
      load();
    } catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
    finally { setSubmitting(""); }
  };

  const createFactor = async (e) => {
    e.preventDefault(); setSubmitting("factor");
    try {
      await api.post("/environmental/emission-factors", {
        source_type: factorForm.source_type,
        unit: factorForm.unit,
        co2_per_unit: Number(factorForm.co2_per_unit)
      });
      setFactorForm({ source_type: "expense", unit: "", co2_per_unit: "" });
      showToast("⚙️ Emission factor configured!");
      load();
    } catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
    finally { setSubmitting(""); }
  };

  const simulateErp = async (e) => {
    e.preventDefault(); setSubmitting("erp");
    try {
      const recId = erpForm.source_record_id || `ERP-${erpForm.source_type.toUpperCase()}-${Math.floor(1000 + Math.random()*9000)}`;
      const res = await api.post(`/environmental/simulate-erp-transaction?source_type=${erpForm.source_type}&amount=${Number(erpForm.amount)}&department_id=${Number(erpForm.department_id)}&source_record_id=${recId}`);
      
      if (res.data?.transaction) {
        showToast("⚡ ERP transaction auto-processed & emissions calculated!");
      } else {
        showToast(res.data?.detail || "ERP event processed, but auto-calc is off.", "info");
      }
      setErpForm({ department_id: "", source_type: "expense", amount: "", source_record_id: "" });
      load();
    } catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
    finally { setSubmitting(""); }
  };

  const totalCO2 = transactions.reduce((s,t)=>s+(t.calculated_co2||0),0);
  const srcIcons  = { purchase:"🛒", manufacturing:"🏭", expense:"💳", fleet:"🚗" };

  return (
    <Layout>
      {toast && (
        <div style={{
          position:"fixed", top:20, right:20, zIndex:9999,
          background: toast.type==="error" ? "rgba(220,38,38,0.1)" : toast.type==="info" ? "rgba(8,145,178,0.1)" : "rgba(22,163,74,0.1)",
          border:`1px solid ${toast.type==="error" ? "rgba(220,38,38,0.3)" : toast.type==="info" ? "rgba(8,145,178,0.3)" : "rgba(22,163,74,0.3)"}`,
          color: toast.type==="error" ? "#dc2626" : toast.type==="info" ? "#0891b2" : "#16a34a",
          padding:"0.75rem 1.25rem", borderRadius:10,
          fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem",
          animation:"fadeUp 0.3s ease-out",
          boxShadow:"0 4px 16px rgba(0,0,0,0.08)",
        }}>{toast.msg}</div>
      )}
      
      <div className="page-enter">
        {/* Header */}
        <div style={{ marginBottom:"2rem" }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"#16a34a", letterSpacing:"0.2em", marginBottom:4, fontWeight:700 }}>▶ PLANET MODULE</div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.5rem", fontWeight:900, color:"var(--text-primary)", margin:0 }}>
            🌿 <span style={{ background:"linear-gradient(135deg,#16a34a,#059669)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Environmental</span> Tracker
          </h1>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
          {[
            { key: "tracking", label: "Tracking & Goals", icon: "📊" },
            { key: "erp", label: "ERP Simulator", icon: "⚡" },
            ...(isManager ? [{ key: "config", label: "Configuration", icon: "⚙️" }] : [])
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              fontFamily: "'Orbitron',sans-serif", fontSize: "0.65rem", fontWeight: 700,
              padding: "0.4rem 0.9rem", borderRadius: "6px 6px 0 0", cursor: "pointer",
              background: activeTab === t.key ? "rgba(22,163,74,0.08)" : "transparent",
              border: activeTab === t.key ? "1px solid rgba(22,163,74,0.2)" : "1px solid transparent",
              borderBottom: activeTab === t.key ? "2px solid #16a34a" : "1px solid transparent",
              color: activeTab === t.key ? "#16a34a" : "var(--text-muted)", marginBottom: "-9px", letterSpacing: "0.06em",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, flexDirection: "column", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(22,163,74,0.2)", borderTop: "3px solid #16a34a", animation: "spin 1s linear infinite" }} />
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.75rem", color: "#94a3b8", letterSpacing: "0.15em" }}>LOADING DATA...</div>
          </div>
        ) : (
          <div style={{ animation: "fadeUp 0.3s ease-out" }}>

            {/* TAB: TRACKING & GOALS */}
            {activeTab === "tracking" && (
              <>
                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"2rem" }}>
                  {[
                    { label:"Total CO₂ (kg)", value:`${totalCO2.toFixed(1)}`, icon:"🌍", color:"#16a34a" },
                    { label:"Transactions",   value:transactions.length,       icon:"📋", color:"#0891b2" },
                    { label:"Active Goals",   value:goals.length,              icon:"🎯", color:"#7c3aed" },
                  ].map((s,i)=>(
                    <div key={i} className="stat-card" style={{ borderLeft:`3px solid ${s.color}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                        <div style={{ fontSize:"0.6rem", color:"var(--text-muted)", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.1em", textTransform:"uppercase" }}>{s.label}</div>
                        <div style={{ fontSize:"1.3rem" }}>{s.icon}</div>
                      </div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"2.2rem", fontWeight:800, color:s.color, lineHeight:1.2 }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"1.5rem" }}>
                  {/* Form */}
                  <div className="game-panel" style={{ padding:"1.5rem" }}>
                    <div className="section-title" style={{ color:"#16a34a" }}>
                      <span>📝</span> Log Carbon Transaction (Manual)
                      <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(22,163,74,0.3),transparent)" }}/>
                    </div>
                    <form onSubmit={submitTx} style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                      {[
                        { label:"DEPARTMENT", key:"department_id", type:"select", opts:departments.map(d=>({val:d.id,lab:d.name})) },
                        { label:"SOURCE TYPE", key:"source_type", type:"select", opts:[{val:"purchase",lab:"🛒 Purchase"},{val:"manufacturing",lab:"🏭 Manufacturing"},{val:"expense",lab:"💳 Expense"},{val:"fleet",lab:"🚗 Fleet"}] },
                        { label:"EMISSION FACTOR", key:"emission_factor_id", type:"select", opts:factors.map(f=>({val:f.id,lab:`${f.source_type} — ${f.co2_per_unit} kg CO₂/${f.unit}`})) },
                      ].map(f=>(
                        <div key={f.key}>
                          <label style={{ fontSize:"0.6rem", color:"#16a34a", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.1em", display:"block", marginBottom:4, fontWeight:700 }}>{f.label}</label>
                          <select className="game-input" value={txForm[f.key]} onChange={e=>setTxForm({...txForm,[f.key]:e.target.value})} required={f.key!=="source_type"}>
                            {f.key==="source_type" ? null : <option value="">Select...</option>}
                            {f.opts.map(o=><option key={o.val} value={o.val}>{o.lab}</option>)}
                          </select>
                        </div>
                      ))}
                      <div>
                        <label style={{ fontSize:"0.6rem", color:"#16a34a", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.1em", display:"block", marginBottom:4, fontWeight:700 }}>AMOUNT (UNITS)</label>
                        <input type="number" step="any" placeholder="0.00" className="game-input"
                          value={txForm.amount} onChange={e=>setTxForm({...txForm,amount:e.target.value})} required />
                      </div>
                      <button type="submit" disabled={submitting==="tx"} className="game-btn" style={{ marginTop:4, background:"linear-gradient(135deg,rgba(22,163,74,0.12),rgba(22,163,74,0.06))", borderColor:"rgba(22,163,74,0.4)", color:"#16a34a" }}>
                        {submitting==="tx" ? "◌ LOGGING..." : "🌿 LOG TRANSACTION"}
                      </button>
                    </form>
                  </div>

                  {/* Goals */}
                  <div className="game-panel" style={{ padding:"1.5rem" }}>
                    <div className="section-title" style={{ color:"#7c3aed" }}>
                      <span>🎯</span> Sustainability Goals
                      <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(124,58,237,0.3),transparent)" }}/>
                    </div>
                    {goals.length===0 ? (
                      <div style={{ textAlign:"center", color:"var(--text-muted)", fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem", padding:"2rem" }}>NO GOALS SET YET</div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                        {goals.map(g=>{
                          const pct = Math.min((g.current_value/g.target_value)*100,100);
                          const done = pct>=100;
                          return (
                            <div key={g.id} style={{ padding:"0.85rem 1rem", background:done?"rgba(22,163,74,0.07)":"rgba(124,58,237,0.05)", border:`1px solid ${done?"rgba(22,163,74,0.2)":"rgba(124,58,237,0.15)"}`, borderRadius:10 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                                <div style={{ fontWeight:600, color:"var(--text-primary)", fontSize:"0.85rem" }}>{done&&"✅ "}{g.metric}</div>
                                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", color:done?"#16a34a":"#7c3aed", fontWeight:700 }}>{pct.toFixed(0)}%</div>
                              </div>
                              <div style={{ height:8, background:"rgba(99,102,241,0.08)", borderRadius:4, overflow:"hidden", marginBottom:6 }}>
                                <div style={{ height:"100%", width:`${pct}%`, background:done?"linear-gradient(90deg,#16a34a,#059669)":"linear-gradient(90deg,#7c3aed,#6d28d9)", borderRadius:4, transition:"width 1s ease-out" }}/>
                              </div>
                              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.65rem", color:"var(--text-muted)", fontFamily:"'Orbitron',sans-serif" }}>
                                <span>{g.current_value}</span><span>TARGET: {g.target_value}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="game-panel" style={{ padding:"1.5rem" }}>
                  <div className="section-title" style={{ color:"#0891b2" }}>
                    <span>📋</span> Carbon Transaction Log
                    <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(8,145,178,0.3),transparent)" }}/>
                  </div>
                  {transactions.length===0 ? (
                    <div style={{ textAlign:"center", color:"var(--text-muted)", fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem", padding:"2rem" }}>NO TRANSACTIONS YET</div>
                  ) : (
                    <table className="game-table">
                      <thead><tr><th>Department</th><th>Source</th><th>CO₂ (kg)</th><th>Date</th><th>Type</th></tr></thead>
                      <tbody>
                        {transactions.map(t=>{
                          const co2 = t.calculated_co2||0;
                          const isAuto = t.auto_calculated;
                          return (
                            <tr key={t.id}>
                              <td style={{ fontWeight:600, color:"var(--text-primary)" }}>{deptName(t.department_id)}</td>
                              <td>{srcIcons[t.source_type]||"⬡"} {t.source_type} {t.source_record_id && `(${t.source_record_id})`}</td>
                              <td style={{ fontFamily:"'Orbitron',sans-serif", color:"#0891b2", fontWeight:700 }}>{co2.toFixed(2)}</td>
                              <td style={{ color:"var(--text-muted)" }}>{t.date}</td>
                              <td>
                                <span className="game-badge" style={{
                                  background: isAuto ? "rgba(8,145,178,0.08)" : "rgba(148,163,184,0.08)",
                                  border: `1px solid ${isAuto ? "rgba(8,145,178,0.25)" : "rgba(148,163,184,0.25)"}`,
                                  color: isAuto ? "#0891b2" : "var(--text-muted)"
                                }}>
                                  {isAuto ? "⚡ AUTO" : "📝 MANUAL"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* TAB: ERP SIMULATOR */}
            {activeTab === "erp" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                {/* Simulator Form */}
                <div className="game-panel" style={{ padding: "1.5rem" }}>
                  <div className="section-title" style={{ color: "#0891b2" }}>
                    <span>⚡</span> Simulate ERP Operation
                    <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(8,145,178,0.3),transparent)" }} />
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.5 }}>
                    Simulate real-time transactions from external enterprise systems (Purchasing, Manufacturing, Fleet, etc.). If the **Auto Emission Calculation** toggle is enabled in settings, this will calculate and log carbon emissions automatically.
                  </p>
                  <form onSubmit={simulateErp} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#0891b2", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.1em", display:"block", marginBottom:4, fontWeight:700 }}>DEPARTMENT</label>
                      <select className="game-input" value={erpForm.department_id} onChange={e=>setErpForm({...erpForm, department_id:e.target.value})} required>
                        <option value="">Select department...</option>
                        {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#0891b2", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.1em", display:"block", marginBottom:4, fontWeight:700 }}>ERP TRANSACTION TYPE</label>
                      <select className="game-input" value={erpForm.source_type} onChange={e=>setErpForm({...erpForm, source_type:e.target.value})}>
                        <option value="purchase">🛒 Purchase Order</option>
                        <option value="manufacturing">🏭 Manufacturing Run</option>
                        <option value="expense">💳 Travel/Utility Expense</option>
                        <option value="fleet">🚗 Vehicle Fleet Mileage</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#0891b2", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.1em", display:"block", marginBottom:4, fontWeight:700 }}>AMOUNT (Units/Liters/kWh)</label>
                      <input type="number" className="game-input" placeholder="e.g. 500" value={erpForm.amount} onChange={e=>setErpForm({...erpForm, amount:e.target.value})} required />
                    </div>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#0891b2", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.1em", display:"block", marginBottom:4, fontWeight:700 }}>SOURCE RECORD ID (Optional)</label>
                      <input className="game-input" placeholder="e.g. PO-98212 (auto-generated if empty)" value={erpForm.source_record_id} onChange={e=>setErpForm({...erpForm, source_record_id:e.target.value})} />
                    </div>
                    <button type="submit" disabled={submitting==="erp"} className="game-btn" style={{ background: "rgba(8,145,178,0.08)", borderColor: "rgba(8,145,178,0.35)", color: "#0891b2" }}>
                      {submitting==="erp" ? "◌ PROCESSING..." : "⚡ SIMULATE ERP TRANSACTION"}
                    </button>
                  </form>
                </div>

                {/* Auto Calculated Log */}
                <div className="game-panel" style={{ padding: "1.5rem" }}>
                  <div className="section-title" style={{ color: "#16a34a" }}>
                    <span>🌍</span> Automated Emission Calculations
                    <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(22,163,74,0.3),transparent)" }} />
                  </div>
                  {transactions.filter(t => t.auto_calculated).length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem", padding: "3rem" }}>
                      No automated calculations processed. Enable **Auto Emission Calculation** in settings and simulate a transaction!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: 380, overflowY: "auto" }}>
                      {transactions.filter(t => t.auto_calculated).map(t => (
                        <div key={t.id} style={{ padding: "0.85rem 1rem", background: "rgba(22,163,74,0.04)", border: "1px solid rgba(22,163,74,0.15)", borderRadius: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{srcIcons[t.source_type]} Simulated {t.source_type.toUpperCase()}</span>
                            <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.8rem", color: "#16a34a", fontWeight: 700 }}>{t.calculated_co2.toFixed(2)} kg CO₂</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                            <span>Dept: {deptName(t.department_id)} · Ref: {t.source_record_id}</span>
                            <span>{t.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CONFIGURATION (Manager only) */}
            {activeTab === "config" && isManager && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                {/* Create Goal */}
                <div className="game-panel" style={{ padding: "1.5rem" }}>
                  <div className="section-title" style={{ color: "#7c3aed" }}>
                    <span>🎯</span> Create Sustainability Goal
                    <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(124,58,237,0.3),transparent)" }} />
                  </div>
                  <form onSubmit={createGoal} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#7c3aed", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>DEPARTMENT</label>
                      <select className="game-input" value={goalForm.department_id} onChange={e=>setGoalForm({...goalForm, department_id:e.target.value})} required>
                        <option value="">Select department...</option>
                        {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#7c3aed", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>METRIC NAME</label>
                      <input className="game-input" placeholder="e.g. CO2 reduction (kg)" value={goalForm.metric} onChange={e=>setGoalForm({...goalForm, metric:e.target.value})} required />
                    </div>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#7c3aed", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>TARGET VALUE</label>
                      <input type="number" className="game-input" placeholder="e.g. 1000" value={goalForm.target_value} onChange={e=>setGoalForm({...goalForm, target_value:e.target.value})} required />
                    </div>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#7c3aed", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>DEADLINE</label>
                      <input type="date" className="game-input" value={goalForm.deadline} onChange={e=>setGoalForm({...goalForm, deadline:e.target.value})} />
                    </div>
                    <button type="submit" disabled={submitting==="goal"} className="game-btn" style={{ background: "rgba(124,58,237,0.08)", borderColor: "rgba(124,58,237,0.35)", color: "#7c3aed" }}>
                      {submitting==="goal" ? "◌ CREATING..." : "🎯 CREATE GOAL"}
                    </button>
                  </form>
                </div>

                {/* Configure Emission Factor (Admin only) */}
                <div className="game-panel" style={{ padding: "1.5rem" }}>
                  <div className="section-title" style={{ color: "#16a34a" }}>
                    <span>⚙️</span> Configure Emission Factor
                    <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(22,163,74,0.3),transparent)" }} />
                  </div>
                  {isAdmin ? (
                    <form onSubmit={createFactor} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div>
                        <label style={{ fontSize:"0.6rem", color:"#16a34a", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>SOURCE TYPE</label>
                        <select className="game-input" value={factorForm.source_type} onChange={e=>setFactorForm({...factorForm, source_type:e.target.value})}>
                          <option value="purchase">🛒 Purchase</option>
                          <option value="manufacturing">🏭 Manufacturing</option>
                          <option value="expense">💳 Expense</option>
                          <option value="fleet">🚗 Fleet</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:"0.6rem", color:"#16a34a", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>UNIT OF MEASURE</label>
                        <input className="game-input" placeholder="e.g. kwh, liter_diesel, unit_product" value={factorForm.unit} onChange={e=>setFactorForm({...factorForm, unit:e.target.value})} required />
                      </div>
                      <div>
                        <label style={{ fontSize:"0.6rem", color:"#16a34a", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>CO₂ PER UNIT (KG)</label>
                        <input type="number" step="any" className="game-input" placeholder="e.g. 2.68" value={factorForm.co2_per_unit} onChange={e=>setFactorForm({...factorForm, co2_per_unit:e.target.value})} required />
                      </div>
                      <button type="submit" disabled={submitting==="factor"} className="game-btn" style={{ background: "linear-gradient(135deg,rgba(22,163,74,0.12),rgba(22,163,74,0.06))", borderColor: "rgba(22,163,74,0.4)", color: "#16a34a" }}>
                        {submitting==="factor" ? "◌ CONFIGURING..." : "⚙️ CONFIGURE FACTOR"}
                      </button>
                    </form>
                  ) : (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", textAlign: "center", padding: "3rem" }}>
                      Only system administrators can create and edit global emission factors.
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
