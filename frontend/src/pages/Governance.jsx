import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Governance() {
  const { user } = useAuth();
  const isManager = user?.role === "admin" || user?.role === "department_head";
  const isAdmin   = user?.role === "admin";

  const [policies, setPolicies]   = useState([]);
  const [issues, setIssues]       = useState([]);
  const [audits, setAudits]       = useState([]);
  const [dash, setDash]           = useState(null);
  const [departments, setDepts]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [acking, setAcking]       = useState(null);
  const [toast, setToast]         = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Create forms
  const [policyForm,  setPolicyForm]  = useState({ title:"", version:"1.0", document_url:"", effective_date:"" });
  const [auditForm,   setAuditForm]   = useState({ scope:"", department_id:"", date_range_start:"", date_range_end:"" });
  const [issueForm,   setIssueForm]   = useState({ description:"", severity:"medium", owner_id:"", department_id:"", due_date:"", audit_id:"" });
  const [submitting, setSubmitting]   = useState("");

  const load = async () => {
    const results = await Promise.allSettled([
      api.get("/governance/policies"),
      api.get("/governance/compliance-issues"),
      api.get("/governance/dashboard"),
      api.get("/governance/audits"),
      api.get("/org/departments"),
      api.get("/org/employees"),
    ]);
    if (results[0].status==="fulfilled") setPolicies(results[0].value.data);
    if (results[1].status==="fulfilled") setIssues(results[1].value.data);
    if (results[2].status==="fulfilled") setDash(results[2].value.data);
    if (results[3].status==="fulfilled") setAudits(results[3].value.data);
    if (results[4].status==="fulfilled") setDepts(results[4].value.data);
    if (results[5].status==="fulfilled") setUsers(results[5].value.data);
  };
  useEffect(()=>{ load(); },[]);

  const showToast=(msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const acknowledge = async (id) => {
    setAcking(id);
    try { await api.post(`/governance/policies/${id}/acknowledge`); showToast("✅ Policy acknowledged!"); load(); }
    catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
    finally { setAcking(null); }
  };

  const createPolicy = async (e) => {
    e.preventDefault(); setSubmitting("policy");
    try {
      const body = { title: policyForm.title, version: policyForm.version };
      if (policyForm.document_url) body.document_url = policyForm.document_url;
      if (policyForm.effective_date) body.effective_date = policyForm.effective_date;
      await api.post("/governance/policies", body);
      showToast("📜 Policy created!"); setPolicyForm({ title:"", version:"1.0", document_url:"", effective_date:"" }); load();
    } catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
    finally { setSubmitting(""); }
  };

  const createAudit = async (e) => {
    e.preventDefault(); setSubmitting("audit");
    try {
      const body = { scope: auditForm.scope };
      if (auditForm.department_id) body.department_id = Number(auditForm.department_id);
      if (auditForm.date_range_start) body.date_range_start = auditForm.date_range_start;
      if (auditForm.date_range_end) body.date_range_end = auditForm.date_range_end;
      await api.post("/governance/audits", body);
      showToast("🔍 Audit created!"); setAuditForm({ scope:"", department_id:"", date_range_start:"", date_range_end:"" }); load();
    } catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
    finally { setSubmitting(""); }
  };

  const createIssue = async (e) => {
    e.preventDefault(); setSubmitting("issue");
    try {
      const body = {
        description: issueForm.description, severity: issueForm.severity,
        owner_id: Number(issueForm.owner_id), due_date: issueForm.due_date,
      };
      if (issueForm.department_id) body.department_id = Number(issueForm.department_id);
      if (issueForm.audit_id) body.audit_id = Number(issueForm.audit_id);
      await api.post("/governance/compliance-issues", body);
      showToast("⚠️ Compliance issue raised!"); setIssueForm({ description:"", severity:"medium", owner_id:"", department_id:"", due_date:"", audit_id:"" }); load();
    } catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
    finally { setSubmitting(""); }
  };

  const updateIssueStatus = async (id, status) => {
    try { await api.put(`/governance/compliance-issues/${id}/status?status=${status}`); showToast("✅ Status updated!"); load(); }
    catch(e) { showToast(e.response?.data?.detail||"Failed","error"); }
  };

  const SEV = {
    low:      { color:"#2563eb", bg:"rgba(37,99,235,0.08)",   border:"rgba(37,99,235,0.2)",   icon:"🔵", label:"LOW" },
    medium:   { color:"#d97706", bg:"rgba(217,119,6,0.08)",   border:"rgba(217,119,6,0.2)",   icon:"🟠", label:"MED" },
    high:     { color:"#dc2626", bg:"rgba(220,38,38,0.08)",   border:"rgba(220,38,38,0.2)",   icon:"🔴", label:"HIGH" },
    critical: { color:"#7c3aed", bg:"rgba(124,58,237,0.08)",  border:"rgba(124,58,237,0.2)",  icon:"💀", label:"CRIT" },
  };
  const STATUS = {
    open:        { color:"#d97706", label:"OPEN" },
    in_progress: { color:"#2563eb", label:"IN PROGRESS" },
    resolved:    { color:"#16a34a", label:"RESOLVED" },
    closed:      { color:"#94a3b8", label:"CLOSED" },
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
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"#d97706", letterSpacing:"0.2em", marginBottom:4, fontWeight:700 }}>▶ COMPLIANCE MODULE</div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.5rem", fontWeight:900, color:"var(--text-primary)", margin:0 }}>
            ⚖️ <span style={{ background:"linear-gradient(135deg,#d97706,#b45309)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Governance</span> Control
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
          {[
            { label:"Open Issues",  value:dash?.open_issues??0,    color:"#d97706", icon:"⚠️" },
            { label:"Overdue",      value:dash?.overdue_issues??0,  color:"#dc2626", icon:"🔴" },
            { label:"Policies",     value:policies.length,          color:"#7c3aed", icon:"📜" },
            { label:"Total Issues", value:issues.length,            color:"#2563eb", icon:"📋" },
          ].map((s,i)=>(
            <div key={i} className="stat-card" style={{ borderLeft:`3px solid ${s.color}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ fontSize:"0.6rem", color:"var(--text-muted)", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.08em", textTransform:"uppercase" }}>{s.label}</div>
                <div style={{ fontSize:"1.2rem" }}>{s.icon}</div>
              </div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"2.2rem", fontWeight:800, color:s.color, lineHeight:1.2 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:"1.5rem", borderBottom:"1px solid var(--border-subtle)", paddingBottom:8 }}>
          {[
            { key:"overview", label:"Overview", icon:"📊" },
            { key:"policies", label:`Policies (${policies.length})`, icon:"📜" },
            { key:"issues",   label:`Issues (${issues.length})`, icon:"⚠️" },
            { key:"audits",   label:`Audits (${audits.length})`, icon:"🔍" },
            ...(isManager ? [{ key:"create", label:"+ Create", icon:"➕" }] : []),
          ].map(t => (
            <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{
              fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", fontWeight:700,
              padding:"0.4rem 0.9rem", borderRadius:"6px 6px 0 0", cursor:"pointer",
              background: activeTab===t.key ? "rgba(217,119,6,0.08)" : "transparent",
              border: activeTab===t.key ? "1px solid rgba(217,119,6,0.2)" : "1px solid transparent",
              borderBottom: activeTab===t.key ? "2px solid #d97706" : "1px solid transparent",
              color: activeTab===t.key ? "#d97706" : "var(--text-muted)", marginBottom:"-9px", letterSpacing:"0.06em",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ animation:"fadeUp 0.3s ease-out" }}>

          {/* OVERVIEW TAB */}
          {activeTab==="overview" && (
            <>
              {dash?.issues_by_severity && Object.keys(dash.issues_by_severity).length > 0 && (
                <div className="game-panel" style={{ padding:"1.25rem", marginBottom:"1.5rem" }}>
                  <div className="section-title" style={{ color:"#d97706" }}>
                    <span>⚠️</span> Issues by Severity
                    <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(217,119,6,0.3),transparent)" }}/>
                  </div>
                  <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
                    {Object.entries(dash.issues_by_severity).map(([sev,count])=>{
                      const sc = SEV[sev]||SEV.low;
                      return (
                        <div key={sev} style={{ padding:"0.75rem 1.5rem", background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:10, textAlign:"center", minWidth:90 }}>
                          <div style={{ fontSize:"1.2rem", marginBottom:2 }}>{sc.icon}</div>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"1.8rem", fontWeight:800, color:sc.color }}>{count}</div>
                          <div style={{ fontSize:"0.6rem", color:sc.color, fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.1em", fontWeight:700 }}>{sc.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>
                {/* Recent Policies */}
                <div className="game-panel" style={{ padding:"1.25rem" }}>
                  <div className="section-title" style={{ color:"#d97706" }}><span>📜</span> Recent Policies
                    <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(217,119,6,0.2),transparent)" }}/>
                  </div>
                  {policies.slice(0,3).map(p=>(
                    <div key={p.id} style={{ padding:"0.65rem 0.85rem", background:"rgba(217,119,6,0.04)", border:"1px solid rgba(217,119,6,0.12)", borderRadius:8, marginBottom:8 }}>
                      <div style={{ fontWeight:600, color:"var(--text-primary)", fontSize:"0.85rem" }}>{p.title} <span style={{ fontSize:"0.6rem", color:"var(--text-muted)" }}>v{p.version}</span></div>
                      {p.effective_date && <div style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>Effective: {p.effective_date}</div>}
                    </div>
                  ))}
                  {policies.length===0 && <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:"0.75rem", padding:"1rem" }}>No policies yet</div>}
                </div>
                {/* Recent Issues */}
                <div className="game-panel" style={{ padding:"1.25rem" }}>
                  <div className="section-title" style={{ color:"#dc2626" }}><span>🔴</span> Recent Issues
                    <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(220,38,38,0.2),transparent)" }}/>
                  </div>
                  {issues.slice(0,3).map(issue=>{
                    const sc=SEV[issue.severity]||SEV.low;
                    return (
                      <div key={issue.id} style={{ padding:"0.65rem 0.85rem", background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:8, marginBottom:8 }}>
                        <div style={{ fontWeight:600, color:"var(--text-primary)", fontSize:"0.82rem" }}>{issue.description}</div>
                        <div style={{ fontSize:"0.65rem", color:sc.color, fontWeight:700, fontFamily:"'Orbitron',sans-serif" }}>{sc.icon} {sc.label} · {issue.status?.toUpperCase()}</div>
                      </div>
                    );
                  })}
                  {issues.length===0 && <div style={{ textAlign:"center", color:"#16a34a", fontSize:"0.75rem", padding:"1rem" }}>✅ All clear</div>}
                </div>
              </div>
            </>
          )}

          {/* POLICIES TAB */}
          {activeTab==="policies" && (
            <div className="game-panel" style={{ padding:"1.5rem" }}>
              <div className="section-title" style={{ color:"#d97706" }}><span>📜</span> All ESG Policies
                <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(217,119,6,0.3),transparent)" }}/>
              </div>
              {policies.length===0 ? (
                <div style={{ textAlign:"center", color:"var(--text-muted)", padding:"3rem", fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem" }}>NO POLICIES — Create one from the + Create tab</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                  {policies.map(p=>(
                    <div key={p.id} style={{ padding:"1rem", background:"rgba(217,119,6,0.04)", border:"1px solid rgba(217,119,6,0.15)", borderLeft:"3px solid #d97706", borderRadius:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:700, color:"var(--text-primary)", fontSize:"0.9rem" }}>{p.title} <span style={{ fontSize:"0.6rem", color:"var(--text-muted)", fontFamily:"'Orbitron',sans-serif" }}>v{p.version}</span></div>
                        {p.effective_date && <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:2 }}>📅 Effective: {p.effective_date}</div>}
                        {p.document_url && <a href={p.document_url} target="_blank" rel="noreferrer" style={{ fontSize:"0.72rem", color:"#0891b2", textDecoration:"none" }}>📎 View Document</a>}
                      </div>
                      <button onClick={()=>acknowledge(p.id)} disabled={acking===p.id} className="game-btn game-btn-gold" style={{ fontSize:"0.65rem" }}>
                        {acking===p.id?"◌ ...":"✓ ACKNOWLEDGE"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ISSUES TAB */}
          {activeTab==="issues" && (
            <div className="game-panel" style={{ padding:"1.5rem" }}>
              <div className="section-title" style={{ color:"#dc2626" }}><span>🔴</span> Compliance Issues
                <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(220,38,38,0.3),transparent)" }}/>
              </div>
              {issues.length===0 ? (
                <div style={{ textAlign:"center", color:"#16a34a", padding:"3rem", fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem" }}>✅ ALL CLEAR — No compliance issues</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                  {issues.map(issue=>{
                    const sc = SEV[issue.severity]||SEV.low;
                    const stc = STATUS[issue.status]||STATUS.open;
                    const overdue = issue.due_date && new Date(issue.due_date)<new Date();
                    return (
                      <div key={issue.id} style={{ padding:"1rem", background:sc.bg, border:`1px solid ${sc.border}`, borderLeft:`3px solid ${sc.color}`, borderRadius:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                          <div style={{ flex:1, marginRight:12 }}>
                            <div style={{ fontWeight:700, color:"var(--text-primary)", fontSize:"0.88rem", marginBottom:4 }}>{issue.description}</div>
                            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                              <span style={{ fontSize:"0.65rem", color:"var(--text-muted)", fontFamily:"'Orbitron',sans-serif" }}>Owner #{issue.owner_id}</span>
                              <span style={{ fontSize:"0.65rem", color:overdue?"#dc2626":"var(--text-muted)", fontFamily:"'Orbitron',sans-serif", fontWeight:overdue?700:400 }}>{overdue?"⏰ OVERDUE:":"📅"} {issue.due_date}</span>
                              <span style={{ fontSize:"0.65rem", color:stc.color, fontFamily:"'Orbitron',sans-serif", fontWeight:700 }}>● {stc.label}</span>
                            </div>
                          </div>
                          <span className="game-badge" style={{ background:sc.bg, border:`1px solid ${sc.border}`, color:sc.color, flexShrink:0 }}>{sc.icon} {sc.label}</span>
                        </div>
                        {isManager && issue.status !== "resolved" && issue.status !== "closed" && (
                          <div style={{ display:"flex", gap:8, marginTop:6 }}>
                            {issue.status==="open" && <button onClick={()=>updateIssueStatus(issue.id,"in_progress")} className="game-btn" style={{ fontSize:"0.6rem" }}>▶ IN PROGRESS</button>}
                            {(issue.status==="open"||issue.status==="in_progress") && <button onClick={()=>updateIssueStatus(issue.id,"resolved")} className="game-btn" style={{ fontSize:"0.6rem", background:"rgba(22,163,74,0.1)", borderColor:"rgba(22,163,74,0.3)", color:"#16a34a" }}>✅ RESOLVE</button>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* AUDITS TAB */}
          {activeTab==="audits" && (
            <div className="game-panel" style={{ padding:"1.5rem" }}>
              <div className="section-title" style={{ color:"#0891b2" }}><span>🔍</span> Audits
                <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(8,145,178,0.3),transparent)" }}/>
              </div>
              {audits.length===0 ? (
                <div style={{ textAlign:"center", color:"var(--text-muted)", padding:"3rem", fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem" }}>NO AUDITS YET</div>
              ) : (
                <table className="game-table">
                  <thead><tr><th>Scope</th><th>Department</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
                  <tbody>
                    {audits.map(a=>(
                      <tr key={a.id}>
                        <td style={{ fontWeight:600, color:"var(--text-primary)" }}>{a.scope}</td>
                        <td>{departments.find(d=>d.id===a.department_id)?.name||"—"}</td>
                        <td style={{ color:"var(--text-muted)" }}>{a.date_range_start||"—"}</td>
                        <td style={{ color:"var(--text-muted)" }}>{a.date_range_end||"—"}</td>
                        <td><span className="game-badge" style={{ background:"rgba(8,145,178,0.08)", border:"1px solid rgba(8,145,178,0.2)", color:"#0891b2" }}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* CREATE TAB (admin/dept_head only) */}
          {activeTab==="create" && isManager && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>

              {/* Create Policy (admin only) */}
              {isAdmin && (
                <div className="game-panel" style={{ padding:"1.5rem" }}>
                  <div className="section-title" style={{ color:"#d97706" }}><span>📜</span> Create Policy
                    <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(217,119,6,0.3),transparent)" }}/>
                  </div>
                  <form onSubmit={createPolicy} style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#d97706", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:4, fontWeight:700 }}>POLICY TITLE *</label>
                      <input className="game-input" placeholder="e.g. Code of Conduct v3" value={policyForm.title} onChange={e=>setPolicyForm({...policyForm,title:e.target.value})} required />
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <div>
                        <label style={{ fontSize:"0.6rem", color:"#d97706", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>VERSION</label>
                        <input className="game-input" placeholder="1.0" value={policyForm.version} onChange={e=>setPolicyForm({...policyForm,version:e.target.value})} />
                      </div>
                      <div>
                        <label style={{ fontSize:"0.6rem", color:"#d97706", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>EFFECTIVE DATE</label>
                        <input type="date" className="game-input" value={policyForm.effective_date} onChange={e=>setPolicyForm({...policyForm,effective_date:e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#d97706", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>DOCUMENT URL</label>
                      <input className="game-input" placeholder="https://..." value={policyForm.document_url} onChange={e=>setPolicyForm({...policyForm,document_url:e.target.value})} />
                    </div>
                    <button type="submit" disabled={submitting==="policy"} className="game-btn game-btn-gold">{submitting==="policy"?"◌ CREATING...":"📜 CREATE POLICY"}</button>
                  </form>
                </div>
              )}

              {/* Create Audit */}
              <div className="game-panel" style={{ padding:"1.5rem" }}>
                <div className="section-title" style={{ color:"#0891b2" }}><span>🔍</span> Create Audit
                  <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(8,145,178,0.3),transparent)" }}/>
                </div>
                <form onSubmit={createAudit} style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                  <div>
                    <label style={{ fontSize:"0.6rem", color:"#0891b2", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>AUDIT SCOPE *</label>
                    <input className="game-input" placeholder="e.g. Q3 Environmental Review" value={auditForm.scope} onChange={e=>setAuditForm({...auditForm,scope:e.target.value})} required />
                  </div>
                  <div>
                    <label style={{ fontSize:"0.6rem", color:"#0891b2", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>DEPARTMENT</label>
                    <select className="game-input" value={auditForm.department_id} onChange={e=>setAuditForm({...auditForm,department_id:e.target.value})}>
                      <option value="">All departments</option>
                      {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#0891b2", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>FROM</label>
                      <input type="date" className="game-input" value={auditForm.date_range_start} onChange={e=>setAuditForm({...auditForm,date_range_start:e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize:"0.6rem", color:"#0891b2", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>TO</label>
                      <input type="date" className="game-input" value={auditForm.date_range_end} onChange={e=>setAuditForm({...auditForm,date_range_end:e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" disabled={submitting==="audit"} className="game-btn" style={{ background:"rgba(8,145,178,0.1)", borderColor:"rgba(8,145,178,0.3)", color:"#0891b2" }}>{submitting==="audit"?"◌ CREATING...":"🔍 CREATE AUDIT"}</button>
                </form>
              </div>

              {/* Create Compliance Issue */}
              <div className="game-panel" style={{ padding:"1.5rem", gridColumn:"1 / -1" }}>
                <div className="section-title" style={{ color:"#dc2626" }}><span>⚠️</span> Raise Compliance Issue
                  <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(220,38,38,0.3),transparent)" }}/>
                </div>
                <form onSubmit={createIssue} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem" }}>
                  <div style={{ gridColumn:"1 / -1" }}>
                    <label style={{ fontSize:"0.6rem", color:"#dc2626", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>DESCRIPTION *</label>
                    <input className="game-input" placeholder="Describe the compliance issue..." value={issueForm.description} onChange={e=>setIssueForm({...issueForm,description:e.target.value})} required />
                  </div>
                  <div>
                    <label style={{ fontSize:"0.6rem", color:"#dc2626", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>SEVERITY *</label>
                    <select className="game-input" value={issueForm.severity} onChange={e=>setIssueForm({...issueForm,severity:e.target.value})}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:"0.6rem", color:"#dc2626", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>ASSIGN OWNER *</label>
                    <select className="game-input" value={issueForm.owner_id} onChange={e=>setIssueForm({...issueForm,owner_id:e.target.value})} required>
                      <option value="">Select owner...</option>
                      {users.map(u=><option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:"0.6rem", color:"#dc2626", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>DUE DATE *</label>
                    <input type="date" className="game-input" value={issueForm.due_date} onChange={e=>setIssueForm({...issueForm,due_date:e.target.value})} required />
                  </div>
                  <div>
                    <label style={{ fontSize:"0.6rem", color:"#dc2626", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>DEPARTMENT</label>
                    <select className="game-input" value={issueForm.department_id} onChange={e=>setIssueForm({...issueForm,department_id:e.target.value})}>
                      <option value="">All</option>
                      {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:"0.6rem", color:"#dc2626", fontFamily:"'Orbitron',sans-serif", display:"block", marginBottom:4, fontWeight:700 }}>LINKED AUDIT</label>
                    <select className="game-input" value={issueForm.audit_id} onChange={e=>setIssueForm({...issueForm,audit_id:e.target.value})}>
                      <option value="">None</option>
                      {audits.map(a=><option key={a.id} value={a.id}>{a.scope}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn:"1 / -1" }}>
                    <button type="submit" disabled={submitting==="issue"} className="game-btn" style={{ background:"rgba(220,38,38,0.08)", borderColor:"rgba(220,38,38,0.3)", color:"#dc2626" }}>{submitting==="issue"?"◌ RAISING...":"⚠️ RAISE COMPLIANCE ISSUE"}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
