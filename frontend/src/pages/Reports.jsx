import { useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";

const REPORTS = [
  { key:"environmental", label:"Environmental", icon:"🌿", color:"#16a34a" },
  { key:"social",        label:"Social",        icon:"🤝", color:"#2563eb" },
  { key:"governance",    label:"Governance",    icon:"⚖️", color:"#d97706" },
  { key:"esg-summary",  label:"ESG Summary",   icon:"⬡",  color:"#0891b2" },
];

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card" style={{ borderLeft:`3px solid ${color}` }}>
      <div style={{ fontSize:"1.3rem", marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:"0.6rem", color:"var(--text-muted)", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.6rem", fontWeight:900, color }}>{value ?? "—"}</div>
    </div>
  );
}

function ReportSummary({ reportKey, data }) {
  if (!data) return null;

  if (reportKey==="esg-summary" && data.department_scores) {
    const rows = data.department_scores;
    return (
      <>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
          <StatCard label="Overall Score" value={data.overall_score} color="#0891b2" icon="⬡" />
          <StatCard label="Period" value={data.period} color="#7c3aed" icon="📅" />
          <StatCard label="Departments" value={rows.length} color="#d97706" icon="🏛" />
        </div>
        <table className="game-table">
          <thead><tr><th>Dept</th><th>Environmental</th><th>Social</th><th>Governance</th><th>Total</th><th>Computed</th></tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td style={{ fontWeight:600, color:"var(--text-primary)" }}>#{r.department_id}</td>
                <td><span style={{ color:"#16a34a", fontFamily:"'Orbitron',sans-serif", fontSize:"0.8rem", fontWeight:700 }}>{r.environmental_score}</span></td>
                <td><span style={{ color:"#2563eb", fontFamily:"'Orbitron',sans-serif", fontSize:"0.8rem", fontWeight:700 }}>{r.social_score}</span></td>
                <td><span style={{ color:"#d97706", fontFamily:"'Orbitron',sans-serif", fontSize:"0.8rem", fontWeight:700 }}>{r.governance_score}</span></td>
                <td style={{ fontFamily:"'Orbitron',sans-serif", color:"#0891b2", fontWeight:900 }}>{r.total_score}</td>
                <td style={{ color:"var(--text-muted)", fontSize:"0.7rem" }}>{r.computed_at ? new Date(r.computed_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  if (reportKey==="environmental") {
    return (
      <>
        {data.totals && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
            <StatCard label="Total CO₂ (kg)" value={data.totals.total_co2?.toFixed(2)} color="#16a34a" icon="🌍" />
            <StatCard label="Transactions" value={data.totals.transaction_count} color="#0891b2" icon="📋" />
            <StatCard label="Goals" value={data.totals.goal_count} color="#7c3aed" icon="🎯" />
          </div>
        )}
        {data.by_source && (
          <>
            <div className="section-title" style={{ color:"#16a34a" }}>
              <span>🌿</span> Emissions by Source
              <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(22,163,74,0.3),transparent)" }}/>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"0.75rem", marginBottom:"1.5rem" }}>
              {Object.entries(data.by_source).map(([src,val])=>(
                <div key={src} style={{ padding:"0.75rem 1.25rem", background:"rgba(22,163,74,0.06)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:10 }}>
                  <div style={{ fontSize:"0.6rem", color:"#16a34a", fontFamily:"'Orbitron',sans-serif", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700 }}>{src}</div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", color:"#16a34a", fontWeight:700, marginTop:2 }}>{typeof val==="number"?val.toFixed(2):JSON.stringify(val)}</div>
                </div>
              ))}
            </div>
          </>
        )}
        <RawJSON data={data} />
      </>
    );
  }

  if (reportKey==="social") {
    return (
      <>
        {data.totals && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
            <StatCard label="Activities" value={data.totals.activity_count} color="#2563eb" icon="🌐" />
            <StatCard label="Participations" value={data.totals.participation_count} color="#0891b2" icon="⚡" />
            <StatCard label="Approved" value={data.totals.approved_count} color="#16a34a" icon="✅" />
          </div>
        )}
        <RawJSON data={data} />
      </>
    );
  }

  if (reportKey==="governance") {
    return (
      <>
        {data.totals && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
            <StatCard label="Total Issues" value={data.totals.issue_count} color="#d97706" icon="⚠" />
            <StatCard label="Open Issues" value={data.totals.open_count} color="#dc2626" icon="🔴" />
            <StatCard label="Policies" value={data.totals.policy_count} color="#7c3aed" icon="📜" />
          </div>
        )}
        <RawJSON data={data} />
      </>
    );
  }

  return <RawJSON data={data} />;
}

function RawJSON({ data }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={()=>setOpen(o=>!o)} className="game-btn" style={{ marginBottom:"0.75rem", fontSize:"0.65rem" }}>
        {open ? "▼ HIDE RAW JSON" : "▶ SHOW RAW JSON"}
      </button>
      {open && (
        <pre style={{
          background:"rgba(15,23,42,0.04)", border:"1px solid var(--border-subtle)",
          borderRadius:10, padding:"1.25rem", fontSize:"0.75rem",
          color:"var(--text-primary)", overflowX:"auto", maxHeight:"60vh", lineHeight:1.6,
          fontFamily:"'Courier New',monospace",
        }}>
          {JSON.stringify(data,null,2)}
        </pre>
      )}
    </div>
  );
}

export default function Reports() {
  const [active, setActive]       = useState(null);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [loadedLabel, setLoaded]  = useState("");

  const run = async (r) => {
    setActive(r.key); setLoaded(r.label); setData(null); setLoading(true);
    try { const res = await api.get(`/reports/${r.key}`); setData(res.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`${active}-report.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const ar = REPORTS.find(r=>r.key===active);

  return (
    <Layout>
      <div className="page-enter">
        <div style={{ marginBottom:"2rem" }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"#0891b2", letterSpacing:"0.2em", marginBottom:4, fontWeight:700 }}>▶ INTELLIGENCE MODULE</div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.5rem", fontWeight:900, color:"var(--text-primary)", margin:0 }}>
            📊 <span style={{ background:"linear-gradient(135deg,#06b6d4,#6366f1)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Intel</span> Reports
          </h1>
        </div>

        {/* Report selector */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
          {REPORTS.map(r=>(
            <button key={r.key} onClick={()=>run(r)} style={{
              background: active===r.key ? `${r.color}12` : "var(--bg-panel)",
              border:`1.5px solid ${active===r.key ? `${r.color}50` : "var(--border-subtle)"}`,
              borderRadius:12, padding:"1.25rem 1rem", cursor:"pointer", transition:"all 0.3s", textAlign:"center",
              boxShadow: active===r.key ? `0 4px 20px ${r.color}20` : "var(--shadow-sm)",
              transform: active===r.key ? "translateY(-3px)" : "none",
            }}
              onMouseEnter={e=>{ if(active!==r.key){ e.currentTarget.style.borderColor=`${r.color}40`; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 4px 16px ${r.color}15`; }}}
              onMouseLeave={e=>{ if(active!==r.key){ e.currentTarget.style.borderColor="var(--border-subtle)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="var(--shadow-sm)"; }}}
            >
              <div style={{ fontSize:"2rem", marginBottom:6 }}>{r.icon}</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:active===r.key ? r.color : "var(--text-secondary)" }}>
                {r.label}
              </div>
              {active===r.key && <div style={{ marginTop:6, width:24, height:3, background:r.color, borderRadius:2, margin:"6px auto 0" }}/>}
            </button>
          ))}
        </div>

        {/* Report panel */}
        <div className="game-panel" style={{ padding:"1.75rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
            <div>
              {active ? (
                <>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", color:"var(--text-muted)", letterSpacing:"0.15em", marginBottom:4 }}>ACTIVE REPORT</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:"1.2rem" }}>{ar?.icon}</span>
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1rem", fontWeight:700, color:ar?.color }}>{loadedLabel} Report</span>
                  </div>
                </>
              ) : (
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.8rem", color:"var(--text-muted)", letterSpacing:"0.1em" }}>SELECT A REPORT ABOVE</div>
              )}
            </div>
            {data && <button onClick={downloadJson} className="game-btn" style={{ fontSize:"0.65rem" }}>💾 EXPORT JSON</button>}
          </div>

          {!active && !loading && (
            <div style={{ textAlign:"center", padding:"4rem 2rem", background:"rgba(6,182,212,0.03)", border:"1px dashed rgba(6,182,212,0.15)", borderRadius:12 }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem", opacity:0.4 }}>📊</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.8rem", color:"var(--text-muted)", letterSpacing:"0.15em" }}>SELECT A REPORT MODULE TO GENERATE INTEL</div>
              <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:8 }}>Environmental · Social · Governance · ESG Summary</div>
            </div>
          )}

          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"4rem", gap:"1rem" }}>
              <div style={{ width:48,height:48,borderRadius:"50%",border:"3px solid rgba(6,182,212,0.15)",borderTop:"3px solid #06b6d4",animation:"spin 1s linear infinite" }}/>
              <div style={{ fontFamily:"'Orbitron',sans-serif", color:"#0891b2", fontSize:"0.8rem", letterSpacing:"0.15em" }}>GENERATING INTEL...</div>
            </div>
          )}

          {!loading && data && (
            <div style={{ animation:"fadeUp 0.4s ease-out" }}>
              <div style={{ height:1, background:`linear-gradient(90deg,${ar?.color||"#0891b2"}40,transparent)`, marginBottom:"1.5rem" }}/>
              <ReportSummary reportKey={active} data={data} />
            </div>
          )}
        </div>

        <div style={{ marginTop:"1rem", padding:"0.75rem 1rem", background:"rgba(6,182,212,0.04)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:10, fontSize:"0.7rem", color:"var(--text-muted)" }}>
          💡 Custom reports: <code style={{ color:"#0891b2", background:"rgba(6,182,212,0.08)", padding:"1px 4px", borderRadius:3 }}>GET /reports/custom</code> supports filters for department, date range, module, employee, and challenge.
        </div>
      </div>
    </Layout>
  );
}
