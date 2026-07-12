import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories]   = useState([]);
  const [config, setConfig]           = useState(null);
  const [deptForm, setDeptForm]       = useState({ name:"", code:"" });
  const [catForm, setCatForm]         = useState({ name:"", type:"csr_activity" });
  const [toast, setToast]             = useState(null);

  const load = async () => {
    const [d,c,cfg] = await Promise.all([
      api.get("/org/departments"),
      api.get("/org/categories"),
      api.get("/scoring/config"),
    ]);
    setDepartments(d.data); setCategories(c.data); setConfig(cfg.data);
  };
  useEffect(()=>{ load(); },[]);

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const addDept = async (e) => {
    e.preventDefault();
    try { await api.post("/org/departments",deptForm); setDeptForm({name:"",code:""}); showToast("🏛 Department created!"); load(); }
    catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
  };

  const addCat = async (e) => {
    e.preventDefault();
    try { await api.post("/org/categories",catForm); setCatForm({name:"",type:"csr_activity"}); showToast("📂 Category created!"); load(); }
    catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
  };

  const saveConfig = async () => {
    try { await api.put("/scoring/config",config); showToast("⚙ Configuration saved!"); }
    catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
  };

  const computeScore = async () => {
    try { await api.post("/scoring/recalculate"); showToast("📊 ESG scores re-computed!"); }
    catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
  };

  return (
    <Layout>
      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:9999,background:toast.type==="error"?"rgba(220,38,38,0.1)":"rgba(22,163,74,0.1)",border:`1px solid ${toast.type==="error"?"rgba(220,38,38,0.3)":"rgba(22,163,74,0.3)"}`,color:toast.type==="error"?"#dc2626":"#16a34a",padding:"0.75rem 1.25rem",borderRadius:10,fontFamily:"'Orbitron',sans-serif",fontSize:"0.75rem",animation:"fadeUp 0.3s",boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
          {toast.msg}
        </div>
      )}
      <div className="page-enter">
        <div style={{ marginBottom:"2rem" }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"#7c3aed", letterSpacing:"0.2em", marginBottom:4, fontWeight:700 }}>▶ ADMIN MODULE</div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.5rem", fontWeight:900, color:"var(--text-primary)", margin:0 }}>
            ⚙️ <span style={{ background:"linear-gradient(135deg,#7c3aed,#6d28d9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Settings</span> & Administration
          </h1>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"1.5rem" }}>
          {/* Departments */}
          <div className="game-panel" style={{ padding:"1.5rem" }}>
            <div className="section-title" style={{ color:"#0891b2" }}>
              <span>🏛</span> Departments
              <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(8,145,178,0.3),transparent)" }}/>
            </div>
            <form onSubmit={addDept} style={{ display:"flex", gap:8, marginBottom:"1rem" }}>
              <input className="game-input" placeholder="Name" value={deptForm.name} onChange={e=>setDeptForm({...deptForm,name:e.target.value})} required style={{ flex:2 }}/>
              <input className="game-input" placeholder="Code" value={deptForm.code} onChange={e=>setDeptForm({...deptForm,code:e.target.value})} required style={{ flex:1 }}/>
              <button type="submit" className="game-btn" style={{ flexShrink:0 }}>+ ADD</button>
            </form>
            {departments.length===0 ? (
              <div style={{ textAlign:"center", color:"var(--text-muted)", fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem", padding:"1.5rem" }}>NO DEPARTMENTS</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                {departments.map(d=>(
                  <div key={d.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.65rem 0.85rem", background:"rgba(8,145,178,0.04)", border:"1px solid rgba(8,145,178,0.12)", borderRadius:8 }}>
                    <div>
                      <span style={{ fontWeight:600, color:"var(--text-primary)", marginRight:8 }}>{d.name}</span>
                      <span className="game-badge" style={{ background:"rgba(8,145,178,0.08)", border:"1px solid rgba(8,145,178,0.2)", color:"#0891b2" }}>{d.code}</span>
                    </div>
                    <span style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>{d.employee_count} members</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="game-panel" style={{ padding:"1.5rem" }}>
            <div className="section-title" style={{ color:"#7c3aed" }}>
              <span>📂</span> Categories
              <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(124,58,237,0.3),transparent)" }}/>
            </div>
            <form onSubmit={addCat} style={{ display:"flex", gap:8, marginBottom:"1rem" }}>
              <input className="game-input" placeholder="Name" value={catForm.name} onChange={e=>setCatForm({...catForm,name:e.target.value})} required style={{ flex:2 }}/>
              <select className="game-input" value={catForm.type} onChange={e=>setCatForm({...catForm,type:e.target.value})} style={{ flex:1 }}>
                <option value="csr_activity">CSR</option>
                <option value="challenge">Challenge</option>
              </select>
              <button type="submit" className="game-btn" style={{ flexShrink:0, background:"rgba(124,58,237,0.1)", borderColor:"rgba(124,58,237,0.4)", color:"#7c3aed" }}>+ ADD</button>
            </form>
            {categories.length===0 ? (
              <div style={{ textAlign:"center", color:"var(--text-muted)", fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem", padding:"1.5rem" }}>NO CATEGORIES</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                {categories.map(c=>(
                  <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.65rem 0.85rem", background:"rgba(124,58,237,0.04)", border:"1px solid rgba(124,58,237,0.12)", borderRadius:8 }}>
                    <span style={{ fontWeight:600, color:"var(--text-primary)" }}>{c.name}</span>
                    <span className="game-badge" style={{ background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.2)", color:"#7c3aed" }}>{c.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ESG Configuration */}
        {config && (
          <div className="game-panel" style={{ padding:"1.5rem" }}>
            <div className="section-title" style={{ color:"#d97706" }}>
              <span>⚡</span> ESG Configuration
              <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(217,119,6,0.3),transparent)" }}/>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem", marginBottom:"1.5rem" }}>
              {[
                { key:"environmental_weight", label:"🌿 Environmental Weight", color:"#16a34a" },
                { key:"social_weight",        label:"🤝 Social Weight",        color:"#2563eb" },
                { key:"governance_weight",    label:"⚖️ Governance Weight",    color:"#d97706" },
              ].map(w=>(
                <div key={w.key}>
                  <label style={{ fontSize:"0.6rem", color:w.color, fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:6, fontWeight:700 }}>{w.label}</label>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <input type="range" min="0" max="100" step="5"
                      value={config[w.key]*100} onChange={e=>setConfig({...config,[w.key]:Number(e.target.value)/100})}
                      style={{ flex:1, accentColor:w.color }}
                    />
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.85rem", fontWeight:700, color:w.color, minWidth:40, textAlign:"right" }}>
                      {(config[w.key]*100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:"2rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
              {[
                { key:"auto_emission_calculation", label:"Auto Emission Calc", icon:"⚡" },
                { key:"evidence_requirement",      label:"Evidence Required",  icon:"📎" },
                { key:"badge_auto_award",          label:"Badge Auto-Award",   icon:"🏅" },
              ].map(t=>(
                <label key={t.key} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:"0.8rem", color:"var(--text-primary)" }}>
                  <span>{t.icon}</span>
                  <input type="checkbox" checked={config[t.key]} onChange={e=>setConfig({...config,[t.key]:e.target.checked})}
                    style={{ width:18, height:18, accentColor:"#06b6d4" }} />
                  {t.label}
                </label>
              ))}
            </div>

            <div style={{ display:"flex", gap:12 }}>
              <button onClick={saveConfig} className="game-btn game-btn-gold">💾 SAVE CONFIG</button>
              <button onClick={computeScore} className="game-btn">📊 RECOMPUTE SCORES</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
