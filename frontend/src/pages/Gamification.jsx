import { useEffect, useState, useRef, useCallback } from "react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const RANK_ICONS = ["🥇","🥈","🥉"];
const DIFF_CFG = {
  easy:   { color:"#16a34a", bg:"rgba(22,163,74,0.08)",  border:"rgba(22,163,74,0.25)",  icon:"⚡" },
  medium: { color:"#d97706", bg:"rgba(217,119,6,0.08)",  border:"rgba(217,119,6,0.25)",  icon:"🔥" },
  hard:   { color:"#dc2626", bg:"rgba(220,38,38,0.08)",  border:"rgba(220,38,38,0.25)",  icon:"💀" },
  epic:   { color:"#7c3aed", bg:"rgba(124,58,237,0.08)", border:"rgba(124,58,237,0.25)", icon:"⚔"  },
};
function diffCfg(d) { return DIFF_CFG[d?.toLowerCase()] || DIFF_CFG.easy; }

/* ── PARTICLE CANVAS ── */
function ParticleCanvas({ light }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); let raf;
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; };
    resize(); window.addEventListener("resize",resize);
    const particles = Array.from({length:60},()=>({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height,
      r:Math.random()*2+0.5, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3,
      alpha:Math.random()*0.4+0.1,
      color:["#06b6d4","#7c3aed","#d97706","#2563eb"][Math.floor(Math.random()*4)],
    }));
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
        if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.color+Math.floor(p.alpha*255).toString(16).padStart(2,"0");
        ctx.fill();
      });
      particles.forEach((a,i)=>{
        particles.slice(i+1).forEach(b=>{
          const dist=Math.hypot(a.x-b.x,a.y-b.y);
          if(dist<80){
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
            ctx.strokeStyle=`rgba(99,102,241,${0.06*(1-dist/80)})`;
            ctx.lineWidth=0.5; ctx.stroke();
          }
        });
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={ref} style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none" }}/>;
}

/* ── LOBBY ── */
function ArenaLobby({ user, onEnter }) {
  const xp = user?.xp_points??0;
  const level = Math.floor(xp/100)+1;
  const [countdown, setCountdown] = useState(null);

  const handleEnter = () => {
    setCountdown(3);
    const t = setInterval(()=>{
      setCountdown(c=>{ if(c<=1){clearInterval(t);onEnter();return null;} return c-1; });
    },700);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:100,
      background:"linear-gradient(135deg,#e0f2fe 0%,#f0f4ff 40%,#faf5ff 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyRules:"center",
      justifyContent:"center", overflow:"hidden",
    }}>
      <ParticleCanvas light />

      {/* Grid */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)",
        backgroundSize:"40px 40px",
      }}/>

      {/* Corner brackets */}
      {[{top:24,left:24,bT:"2px solid #06b6d4",bL:"2px solid #06b6d4",br:"6px 0 0 0"},
        {top:24,right:24,bT:"2px solid #06b6d4",bR:"2px solid #06b6d4",br:"0 6px 0 0"},
        {bottom:24,left:24,bB:"2px solid #06b6d4",bL:"2px solid #06b6d4",br:"0 0 0 6px"},
        {bottom:24,right:24,bB:"2px solid #06b6d4",bR:"2px solid #06b6d4",br:"0 0 6px 0"},
      ].map((s,i)=>(
        <div key={i} style={{ position:"absolute",top:s.top,bottom:s.bottom,left:s.left,right:s.right,width:40,height:40,
          borderTop:s.bT,borderBottom:s.bB,borderLeft:s.bL,borderRight:s.bR,borderRadius:s.br }}/>
      ))}

      {/* Content */}
      <div style={{ position:"relative",zIndex:2,textAlign:"center",padding:"2rem" }}>
        <div style={{
          width:140,height:140,borderRadius:"50%",margin:"0 auto 2rem",
          background:"radial-gradient(circle,rgba(6,182,212,0.12) 0%,transparent 70%)",
          border:"2px solid rgba(6,182,212,0.25)",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:"4rem",
          boxShadow:"0 0 40px rgba(6,182,212,0.15)",
          animation:"glow 2s ease-in-out infinite alternate",
        }}>🏆</div>

        <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.65rem",color:"#0891b2",letterSpacing:"0.3em",marginBottom:8,fontWeight:700 }}>
          ECOSPHERE · GAMIFICATION ENGINE
        </div>
        <h1 style={{
          fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"clamp(2rem,5vw,3.5rem)",
          margin:"0 0 0.5rem",lineHeight:1.1,
          background:"linear-gradient(135deg,#0f172a,#06b6d4)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        }}>
          SUSTAINABILITY<br/><span style={{ background:"linear-gradient(135deg,#06b6d4,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>ARENA</span>
        </h1>
        <div style={{ fontSize:"0.9rem",color:"var(--text-secondary)",marginBottom:"3rem",letterSpacing:"0.05em" }}>
          Complete quests · Earn XP · Claim rewards · Lead the board
        </div>

        {/* Player badge */}
        <div style={{
          display:"inline-flex",alignItems:"center",gap:12,padding:"0.75rem 1.5rem",
          background:"rgba(6,182,212,0.08)",border:"1px solid rgba(6,182,212,0.2)",
          borderRadius:40,marginBottom:"2.5rem",boxShadow:"0 4px 16px rgba(6,182,212,0.1)",
        }}>
          <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#06b6d4,#6366f1)",
            display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:"0.9rem",
          }}>{user?.full_name?.[0]??"?"}</div>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.7rem",color:"#0891b2",fontWeight:700 }}>{user?.full_name}</div>
            <div style={{ fontSize:"0.65rem",color:"var(--text-muted)" }}>Lv.{level} · {xp} XP</div>
          </div>
        </div>

        {/* Enter button */}
        {countdown!==null ? (
          <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"4rem",fontWeight:900,
            background:"linear-gradient(135deg,#06b6d4,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            animation:"glow 0.5s ease-in-out infinite alternate",
          }}>{countdown}</div>
        ) : (
          <button onClick={handleEnter} className="game-btn" style={{
            display:"block",margin:"0 auto",fontSize:"1rem",letterSpacing:"0.2em",
            padding:"1rem 3rem",borderRadius:10,
            background:"linear-gradient(135deg,rgba(6,182,212,0.12),rgba(99,102,241,0.08))",
            border:"2px solid #06b6d4",color:"#0891b2",
            boxShadow:"0 4px 24px rgba(6,182,212,0.2)",
          }}>
            ▶ ENTER ARENA
          </button>
        )}

        <div style={{ marginTop:"1.5rem",fontSize:"0.7rem",color:"var(--text-muted)",letterSpacing:"0.05em" }}>
          Complete ESG challenges to level up and earn real rewards
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"0.75rem 2rem",
        borderTop:"1px solid rgba(99,102,241,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center",
        background:"rgba(255,255,255,0.6)",backdropFilter:"blur(12px)",
      }}>
        <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.6rem",color:"var(--text-muted)",letterSpacing:"0.1em" }}>ECOSPHERE v2.0 · ESG ARENA</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.6rem",color:"var(--text-muted)",letterSpacing:"0.1em" }}>{new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
}

/* ── TOAST ── */
function Toast({ toast }) {
  if(!toast) return null;
  return (
    <div style={{
      position:"fixed",top:20,right:20,zIndex:9999,
      background:toast.type==="error"?"rgba(220,38,38,0.1)":"rgba(22,163,74,0.1)",
      border:`1px solid ${toast.type==="error"?"rgba(220,38,38,0.3)":"rgba(22,163,74,0.3)"}`,
      color:toast.type==="error"?"#dc2626":"#16a34a",
      padding:"0.75rem 1.25rem",borderRadius:10,fontFamily:"'Orbitron',sans-serif",fontSize:"0.75rem",
      animation:"fadeUp 0.3s ease-out",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",maxWidth:380,
    }}>{toast.msg}</div>
  );
}

function XPCounter({ value }) {
  const [d,setD]=useState(0);
  useEffect(()=>{
    const end=value||0,start=Date.now();
    const t=setInterval(()=>{const p=Math.min((Date.now()-start)/1400,1);setD(Math.round((1-Math.pow(1-p,3))*end));if(p>=1)clearInterval(t);},16);
    return()=>clearInterval(t);
  },[value]);
  return <>{d}</>;
}

/* ── QUESTS TAB ── */
function QuestsTab({ challenges, myParticipations, joining, onJoin, onUploadProof }) {
  const [filter,setFilter]=useState("all");
  const diffs=["all","easy","medium","hard","epic"];
  const shown=filter==="all"?challenges:challenges.filter(c=>c.difficulty?.toLowerCase()===filter);

  const getMyStatus = (cid) => myParticipations.find(mp => mp.challenge_id === cid);

  return (
    <div>
      <div style={{ display:"flex",gap:8,marginBottom:"1.25rem",flexWrap:"wrap" }}>
        {diffs.map(d=>{
          const cfg=DIFF_CFG[d]; const active=filter===d;
          return (
            <button key={d} onClick={()=>setFilter(d)} style={{
              fontFamily:"'Orbitron',sans-serif",fontSize:"0.6rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",
              padding:"0.35rem 0.9rem",borderRadius:6,cursor:"pointer",
              background:active?(cfg?.bg||"rgba(6,182,212,0.1)"):"var(--bg-panel)",
              border:`1.5px solid ${active?(cfg?.border||"rgba(6,182,212,0.3)"):"var(--border-subtle)"}`,
              color:active?(cfg?.color||"#0891b2"):"var(--text-muted)",transition:"all 0.2s",
              boxShadow:active?`0 2px 10px ${cfg?.color||"#0891b2"}15`:"none",
            }}>
              {d==="all"?"⬡ ALL":`${cfg?.icon} ${d}`}
            </button>
          );
        })}
        <div style={{ marginLeft:"auto",fontFamily:"'Orbitron',sans-serif",fontSize:"0.6rem",color:"var(--text-muted)",alignSelf:"center" }}>
          {shown.length} QUEST{shown.length!==1?"S":""}
        </div>
      </div>

      {shown.length===0 ? (
        <div style={{ textAlign:"center",padding:"3rem",color:"var(--text-muted)",fontFamily:"'Orbitron',sans-serif",fontSize:"0.75rem" }}>NO ACTIVE QUESTS</div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"1rem" }}>
          {shown.map((c,i)=>{
            const dc=diffCfg(c.difficulty);
            const myParticipation = getMyStatus(c.id);
            const status = myParticipation?.approval || null; // pending | approved | rejected
            const isAuto = myParticipation ? true : false;

            return (
              <div key={c.id} style={{
                background:"var(--bg-panel)",border:`1px solid ${dc.border}`,borderLeft:`3px solid ${dc.color}`,
                borderRadius:12,padding:"1.1rem 1.25rem",transition:"all 0.3s",boxShadow:"var(--shadow-sm)",
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateX(4px)";e.currentTarget.style.boxShadow=`0 4px 20px ${dc.color}18`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateX(0)";e.currentTarget.style.boxShadow="var(--shadow-sm)";}}
              >
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                  <h3 style={{ fontWeight:700,color:"var(--text-primary)",fontSize:"0.95rem",margin:0,flex:1,marginRight:8 }}>{c.title}</h3>
                  <span className="game-badge" style={{ background:dc.bg,border:`1px solid ${dc.border}`,color:dc.color }}>{dc.icon} {c.difficulty?.toUpperCase()}</span>
                </div>
                {c.description && <p style={{ fontSize:"0.75rem",color:"var(--text-secondary)",marginBottom:8,lineHeight:1.5 }}>{c.description}</p>}
                <div style={{ display:"flex",gap:12,marginBottom:"0.9rem",flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.65rem",color:"#d97706",fontWeight:700 }}>⭐ +{c.xp} XP</span>
                  {c.deadline && <span style={{ fontSize:"0.65rem",color:"var(--text-muted)" }}>⏱ {c.deadline}</span>}
                  {c.evidence_required && (
                    <span className="game-badge" style={{ background:"rgba(217,119,6,0.08)",border:"1px solid rgba(217,119,6,0.25)",color:"#d97706" }}>📎 PROOF REQ</span>
                  )}
                </div>
                <div style={{ height:4,background:"rgba(99,102,241,0.08)",borderRadius:2,marginBottom:"0.9rem",overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${Math.min(c.xp||0,100)}%`,background:`linear-gradient(90deg,${dc.color},${dc.color}aa)`,borderRadius:2 }}/>
                </div>
                
                {/* Accept / Progress upload button */}
                {!myParticipation ? (
                  <button onClick={()=>onJoin(c.id)} disabled={joining===c.id} className="game-btn" style={{
                    width:"100%",background:dc.bg,borderColor:dc.border,color:dc.color,opacity:joining===c.id?0.5:1,
                  }}>
                    {joining===c.id?"◌ JOINING...":`${dc.icon} ACCEPT QUEST`}
                  </button>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span className="game-badge" style={{
                        background: status === "approved" ? "rgba(22,163,74,0.08)" : status === "rejected" ? "rgba(220,38,38,0.08)" : "rgba(217,119,6,0.08)",
                        border: `1px solid ${status === "approved" ? "rgba(22,163,74,0.25)" : status === "rejected" ? "rgba(220,38,38,0.25)" : "rgba(217,119,6,0.25)"}`,
                        color: status === "approved" ? "#16a34a" : status === "rejected" ? "#dc2626" : "#d97706",
                        fontSize: "0.62rem"
                      }}>
                        {status === "approved" ? "✅ APPROVED" : status === "rejected" ? "❌ REJECTED" : "⏳ PENDING APPROVAL"}
                      </span>
                      {status === "pending" && !myParticipation.proof_url && (
                        <button onClick={() => onUploadProof(myParticipation.id)} className="game-btn" style={{ fontSize: "0.6rem", padding: "4px 8px" }}>📎 UPLOAD PHOTO</button>
                      )}
                    </div>
                    {myParticipation.proof_url && (
                      <div style={{ marginTop:4 }}>
                        {myParticipation.proof_url.startsWith("data:image") ? (
                          <img src={myParticipation.proof_url} alt="Quest Proof" style={{ maxWidth:"100px", maxHeight:"75px", borderRadius:6, border:"1px solid var(--border-subtle)" }} />
                        ) : (
                          <span style={{ fontSize:"0.68rem", color:"#16a34a" }}>✓ Proof uploaded</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── LEADERBOARD TAB ── */
function LeaderboardTab({ leaderboard, currentUser }) {
  const PODIUM=[
    {color:"#d97706",bg:"rgba(217,119,6,0.06)",border:"rgba(217,119,6,0.2)"},
    {color:"#94a3b8",bg:"rgba(148,163,184,0.06)",border:"rgba(148,163,184,0.2)"},
    {color:"#b45309",bg:"rgba(180,83,9,0.06)",border:"rgba(180,83,9,0.2)"},
  ];

  return (
    <div>
      {leaderboard.length>=3 && (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem",marginBottom:"2rem" }}>
          {[1,0,2].map(rank=>{
            const entry=leaderboard[rank]; if(!entry)return <div key={rank}/>;
            const p=PODIUM[rank]; const h=rank===0?150:rank===1?130:110;
            return (
              <div key={rank} style={{
                background:`linear-gradient(180deg,${p.bg},var(--bg-panel))`,border:`1.5px solid ${p.border}`,borderRadius:14,
                padding:"1.25rem",textAlign:"center",height:h,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
                transition:"all 0.3s",boxShadow:"var(--shadow-sm)",
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 8px 30px ${p.color}18`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="var(--shadow-sm)";}}
              >
                <div style={{ fontSize:rank===0?"2rem":"1.6rem" }}>{RANK_ICONS[rank]}</div>
                <div style={{ fontWeight:700,color:"var(--text-primary)",fontSize:"0.8rem" }}>{entry.full_name}</div>
                <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.75rem",color:p.color,fontWeight:900 }}>{entry.xp_points} XP</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display:"flex",flexDirection:"column",gap:"0.4rem" }}>
        {leaderboard.map((l,idx)=>{
          const p=PODIUM[idx]; const isMe=l.employee_id===currentUser?.id;
          return (
            <div key={l.employee_id} style={{
              display:"flex",alignItems:"center",gap:12,padding:"0.65rem 1rem",borderRadius:10,
              background:isMe?"rgba(6,182,212,0.07)":(p?.bg||"var(--bg-panel)"),
              border:`1px solid ${isMe?"rgba(6,182,212,0.2)":(p?.border||"var(--border-subtle)")}`,
              transition:"all 0.2s",boxShadow:"var(--shadow-sm)",
            }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"0.9rem",minWidth:32,color:p?.color||"var(--text-muted)" }}>
                {idx<3?RANK_ICONS[idx]:`${idx+1}`}
              </div>
              <div style={{ flex:1,fontSize:"0.85rem",color:isMe?"#0891b2":"var(--text-primary)",fontWeight:isMe?700:400 }}>
                {l.full_name}
                {isMe && <span style={{ marginLeft:8,fontSize:"0.6rem",fontFamily:"'Orbitron',sans-serif",color:"#0891b2" }}>(YOU)</span>}
              </div>
              <div style={{ width:80,height:4,background:"rgba(99,102,241,0.08)",borderRadius:2,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${Math.min((l.xp_points/(leaderboard[0]?.xp_points||1))*100,100)}%`,background:p?.color||"var(--text-muted)",borderRadius:2 }}/>
              </div>
              <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.75rem",fontWeight:700,color:p?.color||"var(--text-muted)",minWidth:60,textAlign:"right" }}>
                {l.xp_points} XP
              </div>
            </div>
          );
        })}
        {leaderboard.length===0 && (
          <div style={{ textAlign:"center",padding:"3rem",color:"var(--text-muted)",fontFamily:"'Orbitron',sans-serif",fontSize:"0.75rem" }}>NO PLAYERS RANKED</div>
        )}
      </div>
    </div>
  );
}

/* ── BADGES TAB ── */
function BadgesTab({ badges }) {
  return (
    <div>
      {badges.length===0 ? (
        <div style={{ textAlign:"center",padding:"3rem",color:"var(--text-muted)",fontFamily:"'Orbitron',sans-serif",fontSize:"0.75rem" }}>NO BADGES YET</div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"1rem" }}>
          {badges.map(b=>(
            <div key={b.id} style={{
              textAlign:"center",padding:"1.5rem 1rem",background:"var(--bg-panel)",
              border:"1px solid rgba(124,58,237,0.15)",borderRadius:14,transition:"all 0.3s",
              cursor:"default",boxShadow:"var(--shadow-sm)",
            }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(124,58,237,0.06)";e.currentTarget.style.boxShadow="0 4px 20px rgba(124,58,237,0.12)";e.currentTarget.style.transform="translateY(-4px) scale(1.03)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="var(--bg-panel)";e.currentTarget.style.boxShadow="var(--shadow-sm)";e.currentTarget.style.transform="translateY(0) scale(1)";}}
            >
              <div style={{ fontSize:"2.5rem",marginBottom:8 }}>{b.icon||"🏅"}</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.65rem",fontWeight:700,color:"#7c3aed",letterSpacing:"0.05em",marginBottom:4 }}>{b.name}</div>
              {b.description && <div style={{ fontSize:"0.7rem",color:"var(--text-secondary)",lineHeight:1.4 }}>{b.description}</div>}
              {b.unlock_rule && (
                <div style={{ fontSize:"0.65rem", color:"#7c3aed", marginTop:6, opacity:0.8, lineHeight:1.4 }}>
                  🔓 {(() => {
                    const r = typeof b.unlock_rule === "string" ? JSON.parse(b.unlock_rule) : b.unlock_rule;
                    if (r?.type === "xp") return `Earn ${r.min} XP`;
                    if (r?.type === "challenges_completed") return `Complete ${r.min} challenge${r.min !== 1 ? "s" : ""}`;
                    if (r?.type === "activities_completed") return `Complete ${r.min} activit${r.min !== 1 ? "ies" : "y"}`;
                    return Object.entries(r || {}).map(([k,v])=>`${k}: ${v}`).join(", ");
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── REWARDS TAB ── */
function RewardsTab({ rewards, userXP, redeeming, onRedeem }) {
  return (
    <div>
      {rewards.length===0 ? (
        <div style={{ textAlign:"center",padding:"3rem",color:"var(--text-muted)",fontFamily:"'Orbitron',sans-serif",fontSize:"0.75rem" }}>NO REWARDS IN CATALOG</div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1rem" }}>
          {rewards.map(r=>{
            const canAfford=userXP>=r.points_required;
            const pct=Math.min((userXP/r.points_required)*100,100);
            return (
              <div key={r.id} style={{
                background:"var(--bg-panel)",border:`1px solid ${canAfford?"rgba(217,119,6,0.2)":"var(--border-subtle)"}`,
                borderLeft:`3px solid ${canAfford?"#d97706":"var(--border-subtle)"}`,borderRadius:12,padding:"1.1rem 1.25rem",
                opacity:r.stock===0?0.5:1,transition:"all 0.3s",boxShadow:"var(--shadow-sm)",
              }}
                onMouseEnter={e=>{if(r.stock>0){e.currentTarget.style.transform="translateX(3px)";e.currentTarget.style.boxShadow=canAfford?"0 4px 20px rgba(217,119,6,0.12)":"var(--shadow-md)";}}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateX(0)";e.currentTarget.style.boxShadow="var(--shadow-sm)";}}
              >
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                  <div style={{ fontWeight:700,color:"var(--text-primary)",fontSize:"0.9rem" }}>{r.name}</div>
                  {r.stock===0
                    ? <span className="game-badge" style={{ background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.25)",color:"#dc2626" }}>OUT OF STOCK</span>
                    : <span className="game-badge" style={{ background:"rgba(22,163,74,0.08)",border:"1px solid rgba(22,163,74,0.25)",color:"#16a34a" }}>{r.stock} LEFT</span>
                  }
                </div>
                {r.description && <p style={{ fontSize:"0.75rem",color:"var(--text-secondary)",marginBottom:8 }}>{r.description}</p>}
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:"0.65rem" }}>
                    <span style={{ fontFamily:"'Orbitron',sans-serif",color:"#d97706",fontWeight:700 }}>⭐ {r.points_required} pts</span>
                    <span style={{ color:canAfford?"#16a34a":"#dc2626",fontWeight:600 }}>{canAfford?"✓ CAN AFFORD":`Need ${r.points_required-userXP} more`}</span>
                  </div>
                  <div style={{ height:5,background:"rgba(99,102,241,0.08)",borderRadius:3,overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${pct}%`,background:canAfford?"linear-gradient(90deg,#d97706,#b45309)":"linear-gradient(90deg,#dc2626,#b91c1c)",borderRadius:3,transition:"width 1s ease-out" }}/>
                  </div>
                </div>
                <button onClick={()=>onRedeem(r.id,r.name)} disabled={redeeming===r.id||r.stock===0||!canAfford}
                  className="game-btn game-btn-gold" style={{ width:"100%",opacity:(redeeming===r.id||r.stock===0||!canAfford)?0.45:1 }}>
                  {redeeming===r.id?"◌ CLAIMING...":"🎁 CLAIM REWARD"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── MANAGER CHALLENGE APPROVALS ── */
function ManagerChallengeApprovals({ loadMain }) {
  const [pending, setPending] = useState([]);
  const [deciding, setDeciding] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/gamification/challenge-participations", { params: { status: "pending" } });
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
      await api.put(`/gamification/challenge-participations/${id}/decision?approve=${approve}`);
      showToast(approve ? "✅ Challenge participation approved!" : "❌ Challenge participation rejected.");
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
        <span>⚙️</span> Manager — Pending Challenge Approvals ({pending.length})
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
                  <span style={{ fontSize: "0.75rem", color: "#475569" }}>· Challenge #{p.challenge_id}</span>
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

/* ── MAIN ── */
export default function Gamification() {
  const { user } = useAuth();
  const [entered,setEntered]     = useState(false);
  const [entering,setEntering]   = useState(false);
  
  // State variables
  const [challenges,setChallenges] = useState([]);
  const [myParticipations, setMyParts] = useState([]);
  const [badges,setBadges]       = useState([]);
  const [rewards,setRewards]     = useState([]);
  const [leaderboard,setLB]     = useState([]);
  const [tab,setTab]             = useState("quests");
  
  const [joining,setJoining]     = useState(null);
  const [redeeming,setRedeeming] = useState(null);
  const [toast,setToast]         = useState(null);

  const fileInputRef = useRef(null);
  const [selectedPartId, setSelectedPartId] = useState(null);

  const isManager = user?.role === "admin" || user?.role === "department_head";

  const load = useCallback(async()=>{
    try {
      const [c,b,r,l,mp] = await Promise.all([
        api.get("/gamification/challenges",{params:{status:"active"}}),
        api.get("/gamification/badges"),
        api.get("/gamification/rewards"),
        api.get("/gamification/leaderboard"),
        api.get("/gamification/challenge-participations/mine")
      ]);
      setChallenges(c.data || []);
      setBadges(b.data || []);
      setRewards(r.data || []);
      setLB(l.data || []);
      setMyParts(mp.data || []);
    } catch(e) {
      console.error(e);
    }
  },[]);

  useEffect(()=>{load();},[load]);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};

  const handleEnter=()=>{setEntering(true);setTimeout(()=>{setEntered(true);setEntering(false);},300);};

  const join=async(id)=>{
    setJoining(id);
    try{
      await api.post("/gamification/challenge-participations",{challenge_id:id});
      showToast("⚡ Quest accepted!");
      load();
    }
    catch(e){showToast(e.response?.data?.detail||"Could not join","error");}
    finally{setJoining(null);}
  };

  const triggerUploadProof = (pId) => {
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
        await api.put(`/gamification/challenge-participations/${selectedPartId}/progress`, {
          progress: 100.0,
          proof_url: base64data
        });
        showToast("📎 Photo evidence uploaded successfully!");
        load();
      } catch (err) {
        showToast(err.response?.data?.detail || "Failed to upload proof", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  const redeem=async(id,name)=>{
    setRedeeming(id);
    try{const res=await api.post(`/gamification/rewards/${id}/redeem`);showToast(`🏆 "${name}" claimed! ${res.data.remaining_points} pts remaining.`);load();}
    catch(e){showToast(e.response?.data?.detail||"Could not redeem","error");}
    finally{setRedeeming(null);}
  };

  const xp=user?.xp_points??0;
  const level=Math.floor(xp/100)+1;
  const xpInLevel=xp%100;

  const TABS=[
    {key:"quests",icon:"⚔",label:"Quests",count:challenges.length},
    {key:"leaderboard",icon:"🏆",label:"Leaderboard",count:leaderboard.length},
    {key:"badges",icon:"🎖",label:"Badges",count:badges.length},
    {key:"rewards",icon:"🎁",label:"Rewards",count:rewards.length},
  ];

  if(!entered) return <div style={{opacity:entering?0:1,transition:"opacity 0.3s"}}><ArenaLobby user={user} onEnter={handleEnter}/></div>;

  return (
    <Layout>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display:"none" }} accept="image/*" />
      <Toast toast={toast}/>
      <div className="page-enter">
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"2rem",flexWrap:"wrap",gap:12 }}>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.6rem",color:"#d97706",letterSpacing:"0.2em",marginBottom:4,fontWeight:700 }}>▶ SUSTAINABILITY ARENA · LIVE</div>
            <h1 style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.4rem",fontWeight:900,color:"var(--text-primary)",margin:0 }}>
              🏆 <span style={{ background:"linear-gradient(135deg,#d97706,#b45309)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>GAME</span> BOARD
            </h1>
          </div>
          <button onClick={()=>setEntered(false)} className="game-btn" style={{ fontSize:"0.6rem",background:"var(--bg-panel)",borderColor:"var(--border-subtle)",color:"var(--text-muted)" }}>
            ← LOBBY
          </button>
        </div>

        {/* Player HUD */}
        <div style={{
          display:"grid",gridTemplateColumns:"auto 1fr repeat(3,auto)",gap:"1.5rem",alignItems:"center",
          padding:"1.25rem 1.5rem",marginBottom:"2rem",
          background:"var(--bg-panel)",border:"1px solid rgba(217,119,6,0.15)",borderRadius:14,
          boxShadow:"0 4px 24px rgba(217,119,6,0.06)",
        }}>
          <div style={{
            width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#d97706,#b45309)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",fontWeight:900,color:"#fff",
            boxShadow:"0 4px 16px rgba(217,119,6,0.3)",position:"relative",flexShrink:0,
          }}>
            {user?.full_name?.[0]??"?"}
            <div style={{ position:"absolute",bottom:-6,right:-6,background:"#d97706",color:"#fff",fontFamily:"'Orbitron',sans-serif",fontSize:"0.45rem",fontWeight:900,padding:"2px 4px",borderRadius:3 }}>LV.{level}</div>
          </div>

          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:"var(--text-primary)",marginBottom:2 }}>{user?.full_name}</div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
              <span style={{ fontSize:"0.6rem",color:"#d97706",fontFamily:"'Orbitron',sans-serif",fontWeight:700 }}>XP</span>
              <div className="xp-bar-track" style={{ flex:1,maxWidth:200 }}>
                <div className="xp-bar-fill" style={{ width:`${xpInLevel}%` }}/>
              </div>
              <span style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.65rem",color:"#d97706",fontWeight:700 }}><XPCounter value={xp}/> XP</span>
            </div>
            <div style={{ fontSize:"0.65rem",color:"var(--text-muted)" }}>{user?.role} · {xpInLevel}/100 to next level</div>
          </div>

          {[
            {label:"Quests",value:challenges.length,color:"#0891b2"},
            {label:"Badges",value:badges.length,color:"#7c3aed"},
            {label:"Rewards",value:rewards.filter(r=>r.stock>0).length,color:"#d97706"},
          ].map(s=>(
            <div key={s.label} style={{ textAlign:"center",padding:"0.5rem 1rem",borderRadius:10,background:"rgba(99,102,241,0.04)",border:"1px solid var(--border-subtle)" }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.3rem",fontWeight:900,color:s.color }}>{s.value}</div>
              <div style={{ fontSize:"0.6rem",color:"var(--text-muted)",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex",gap:"0.5rem",marginBottom:"1.75rem",borderBottom:"1px solid var(--border-subtle)",paddingBottom:"0.5rem" }}>
          {TABS.map(t=>{
            const active=tab===t.key;
            return (
              <button key={t.key} onClick={()=>setTab(t.key)} style={{
                fontFamily:"'Orbitron',sans-serif",fontSize:"0.65rem",fontWeight:700,letterSpacing:"0.08em",
                padding:"0.55rem 1.1rem",borderRadius:"8px 8px 0 0",cursor:"pointer",transition:"all 0.2s",
                background:active?"rgba(6,182,212,0.08)":"transparent",
                border:active?"1px solid rgba(6,182,212,0.2)":"1px solid transparent",
                borderBottom:active?"2px solid #06b6d4":"1px solid transparent",
                color:active?"#0891b2":"var(--text-muted)",marginBottom:"-1px",
              }}>
                {t.icon} {t.label}
                {t.count>0 && <span style={{ marginLeft:6,fontSize:"0.55rem",background:active?"rgba(6,182,212,0.1)":"rgba(99,102,241,0.06)",color:active?"#0891b2":"var(--text-muted)",padding:"1px 5px",borderRadius:10 }}>{t.count}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ animation:"fadeUp 0.35s ease-out" }}>
          {tab==="quests"      && (
            <>
              <QuestsTab challenges={challenges} myParticipations={myParticipations} joining={joining} onJoin={join} onUploadProof={triggerUploadProof}/>
              {isManager && <ManagerChallengeApprovals loadMain={load} />}
            </>
          )}
          {tab==="leaderboard" && <LeaderboardTab leaderboard={leaderboard} currentUser={user}/>}
          {tab==="badges"      && <BadgesTab badges={badges}/>}
          {tab==="rewards"     && <RewardsTab rewards={rewards} userXP={xp} redeeming={redeeming} onRedeem={redeem}/>}
        </div>
      </div>
    </Layout>
  );
}
