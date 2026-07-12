import { useEffect, useState, useRef, useCallback } from "react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
const RANK_ICONS  = ["🥇","🥈","🥉"];
const DIFF_CFG = {
  easy:   { color:"#22c55e", bg:"rgba(34,197,94,0.12)",   border:"rgba(34,197,94,0.3)",   icon:"⚡", xpMult:1 },
  medium: { color:"#f97316", bg:"rgba(249,115,22,0.12)",  border:"rgba(249,115,22,0.3)",  icon:"🔥", xpMult:2 },
  hard:   { color:"#ef4444", bg:"rgba(239,68,68,0.12)",   border:"rgba(239,68,68,0.3)",   icon:"💀", xpMult:3 },
  epic:   { color:"#a855f7", bg:"rgba(168,85,247,0.12)",  border:"rgba(168,85,247,0.3)",  icon:"⚔", xpMult:5 },
};

function diffCfg(d) { return DIFF_CFG[d?.toLowerCase()] || DIFF_CFG.easy; }

/* ─────────────────────────────────────────────────────────
   PARTICLE CANVAS  (floating orbs behind lobby)
───────────────────────────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      color: ["#00ffe0","#a855f7","#ffd700","#3b82f6"][Math.floor(Math.random()*4)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2,"0");
        ctx.fill();
      });
      // Draw connecting lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,255,224,${0.08 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />;
}

/* ─────────────────────────────────────────────────────────
   LOBBY SCREEN  (click to enter)
───────────────────────────────────────────────────────── */
function ArenaLobby({ user, onEnter }) {
  const xp    = user?.xp_points ?? 0;
  const level = Math.floor(xp / 100) + 1;
  const [pulse, setPulse] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const handleEnter = () => {
    setPulse(true);
    setCountdown(3);
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); onEnter(); return null; }
        return c - 1;
      });
    }, 700);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:100,
      background:"radial-gradient(ellipse at center, #0d1a2e 0%, #060911 60%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      overflow:"hidden",
    }}>
      <ParticleCanvas />

      {/* Hex grid overlay */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(0,255,224,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,224,0.03) 1px,transparent 1px)",
        backgroundSize:"40px 40px",
      }}/>

      {/* Top corner brackets */}
      {[["0","0","top","left"],["0","0","top","right"],["auto","0","bottom","left"],["auto","0","bottom","right"]].map(([t,b,topK,sideK],i)=>(
        <div key={i} style={{
          position:"absolute", [topK]:24, [sideK]:24,
          width:40, height:40,
          borderTop: (topK==="top") ? "2px solid rgba(0,255,224,0.4)" : "none",
          borderBottom: (topK==="bottom") ? "2px solid rgba(0,255,224,0.4)" : "none",
          borderLeft: (sideK==="left") ? "2px solid rgba(0,255,224,0.4)" : "none",
          borderRight: (sideK==="right") ? "2px solid rgba(0,255,224,0.4)" : "none",
          borderRadius: topK==="top" && sideK==="left" ? "6px 0 0 0" : topK==="top" && sideK==="right" ? "0 6px 0 0" : topK==="bottom" && sideK==="left" ? "0 0 0 6px" : "0 0 6px 0",
        }}/>
      ))}

      {/* Scanline */}
      <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)", pointerEvents:"none" }}/>

      {/* Content */}
      <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"2rem" }}>
        {/* Logo glow ring */}
        <div style={{
          width:140, height:140, borderRadius:"50%", margin:"0 auto 2rem",
          background:"radial-gradient(circle, rgba(0,255,224,0.15) 0%, transparent 70%)",
          border:"2px solid rgba(0,255,224,0.3)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"4rem",
          boxShadow:"0 0 40px rgba(0,255,224,0.2), inset 0 0 40px rgba(0,255,224,0.05)",
          animation:"glow 2s ease-in-out infinite alternate",
        }}>🏆</div>

        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", color:"rgba(0,255,224,0.5)", letterSpacing:"0.3em", marginBottom:8 }}>
          ECOSPHERE · GAMIFICATION ENGINE
        </div>
        <h1 style={{
          fontFamily:"'Orbitron',sans-serif", fontWeight:900, fontSize:"clamp(2rem,5vw,3.5rem)",
          color:"#fff", margin:"0 0 0.5rem", lineHeight:1.1,
          textShadow:"0 0 30px rgba(0,255,224,0.4)",
        }}>
          SUSTAINABILITY<br/><span style={{ color:"#00ffe0", textShadow:"0 0 20px rgba(0,255,224,0.8)" }}>ARENA</span>
        </h1>
        <div style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.4)", marginBottom:"3rem", letterSpacing:"0.05em" }}>
          Complete quests · Earn XP · Claim rewards · Lead the board
        </div>

        {/* Player badge */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:12, padding:"0.75rem 1.5rem",
          background:"rgba(0,255,224,0.06)", border:"1px solid rgba(0,255,224,0.2)",
          borderRadius:40, marginBottom:"2.5rem",
        }}>
          <div style={{
            width:36, height:36, borderRadius:"50%",
            background:"linear-gradient(135deg,#00ffe0,#00c8a8)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#0a0e1a", fontWeight:900, fontSize:"0.9rem",
          }}>{user?.full_name?.[0] ?? "?"}</div>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem", color:"#00ffe0", fontWeight:700 }}>{user?.full_name}</div>
            <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.3)" }}>Lv.{level} · {xp} XP</div>
          </div>
        </div>

        {/* ENTER button */}
        {countdown !== null ? (
          <div style={{
            fontFamily:"'Orbitron',sans-serif", fontSize:"4rem", fontWeight:900,
            color:"#00ffe0", textShadow:"0 0 40px rgba(0,255,224,0.8)",
            animation:"glow 0.5s ease-in-out infinite alternate",
          }}>{countdown}</div>
        ) : (
          <button
            onClick={handleEnter}
            style={{
              display:"block", margin:"0 auto",
              fontFamily:"'Orbitron',sans-serif", fontWeight:900,
              fontSize:"1rem", letterSpacing:"0.2em",
              color: pulse ? "#0a0e1a" : "#00ffe0",
              background: pulse
                ? "linear-gradient(135deg,#00ffe0,#00c8a8)"
                : "linear-gradient(135deg,rgba(0,255,224,0.12),rgba(0,200,170,0.08))",
              border:"2px solid #00ffe0",
              borderRadius:8, padding:"1rem 3rem",
              cursor:"pointer", transition:"all 0.3s",
              boxShadow: pulse
                ? "0 0 60px rgba(0,255,224,0.8)"
                : "0 0 20px rgba(0,255,224,0.3)",
            }}
            onMouseEnter={e => {
              if (!pulse) {
                e.currentTarget.style.background = "linear-gradient(135deg,#00ffe0,#00c8a8)";
                e.currentTarget.style.color = "#0a0e1a";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(0,255,224,0.7)";
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={e => {
              if (!pulse) {
                e.currentTarget.style.background = "linear-gradient(135deg,rgba(0,255,224,0.12),rgba(0,200,170,0.08))";
                e.currentTarget.style.color = "#00ffe0";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(0,255,224,0.3)";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            ▶ ENTER ARENA
          </button>
        )}

        <div style={{ marginTop:"1.5rem", fontSize:"0.7rem", color:"rgba(255,255,255,0.2)", letterSpacing:"0.05em" }}>
          Complete ESG challenges to level up and earn real rewards
        </div>
      </div>

      {/* Bottom HUD bar */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        padding:"0.75rem 2rem",
        borderTop:"1px solid rgba(0,255,224,0.1)",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        background:"rgba(6,9,17,0.8)",
      }}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"rgba(0,255,224,0.3)", letterSpacing:"0.1em" }}>
          ECOSPHERE v2.0 · ESG ARENA
        </div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"rgba(0,255,224,0.3)", letterSpacing:"0.1em" }}>
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MINI COMPONENTS
───────────────────────────────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position:"fixed", top:20, right:20, zIndex:9999,
      background: toast.type==="error" ? "rgba(239,68,68,0.15)" : "rgba(0,255,224,0.12)",
      border:`1px solid ${toast.type==="error" ? "rgba(239,68,68,0.4)" : "rgba(0,255,224,0.4)"}`,
      color: toast.type==="error" ? "#ef4444" : "#00ffe0",
      padding:"0.75rem 1.25rem", borderRadius:8,
      fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem",
      letterSpacing:"0.05em", animation:"fadeUp 0.3s ease-out",
      maxWidth:380, boxShadow: toast.type==="error" ? "0 0 20px rgba(239,68,68,0.3)" : "0 0 20px rgba(0,255,224,0.3)",
    }}>
      {toast.msg}
    </div>
  );
}

function XPCounter({ value }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    const end = value || 0, start = Date.now();
    const t = setInterval(() => {
      const p = Math.min((Date.now()-start)/1400,1);
      setD(Math.round((1-Math.pow(1-p,3))*end));
      if(p>=1) clearInterval(t);
    },16);
    return ()=>clearInterval(t);
  },[value]);
  return <>{d}</>;
}

/* ─────────────────────────────────────────────────────────
   ACTIVE CHALLENGES TAB
───────────────────────────────────────────────────────── */
function QuestsTab({ challenges, joining, onJoin }) {
  const [filter, setFilter] = useState("all");
  const diffs = ["all","easy","medium","hard","epic"];
  const shown = filter==="all" ? challenges : challenges.filter(c=>c.difficulty?.toLowerCase()===filter);

  return (
    <div>
      {/* Difficulty filter */}
      <div style={{ display:"flex", gap:8, marginBottom:"1.25rem", flexWrap:"wrap" }}>
        {diffs.map(d=>{
          const cfg = DIFF_CFG[d];
          const active = filter===d;
          return (
            <button key={d} onClick={()=>setFilter(d)} style={{
              fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", fontWeight:700,
              letterSpacing:"0.08em", textTransform:"uppercase",
              padding:"0.35rem 0.9rem", borderRadius:5, cursor:"pointer",
              background: active ? (cfg?.bg||"rgba(0,255,224,0.12)") : "rgba(255,255,255,0.03)",
              border:`1px solid ${active ? (cfg?.border||"rgba(0,255,224,0.4)") : "rgba(255,255,255,0.08)"}`,
              color: active ? (cfg?.color||"#00ffe0") : "rgba(255,255,255,0.35)",
              transition:"all 0.2s",
            }}>
              {d==="all" ? "⬡ ALL" : `${cfg?.icon} ${d}`}
            </button>
          );
        })}
        <div style={{ marginLeft:"auto", fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"rgba(0,255,224,0.4)", alignSelf:"center" }}>
          {shown.length} QUEST{shown.length!==1?"S":""}
        </div>
      </div>

      {shown.length===0 ? (
        <div style={{ textAlign:"center", padding:"3rem", color:"rgba(0,255,224,0.25)", fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem" }}>
          NO ACTIVE QUESTS IN THIS DIFFICULTY
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:"1rem" }}>
          {shown.map((c,i)=>{
            const dc = diffCfg(c.difficulty);
            return (
              <div key={c.id} style={{
                background:"linear-gradient(135deg,rgba(17,24,39,0.97),rgba(10,14,26,0.99))",
                border:`1px solid ${dc.border}`,
                borderLeft:`3px solid ${dc.color}`,
                borderRadius:10, padding:"1.1rem 1.25rem",
                transition:"all 0.3s",
                animationDelay:`${i*0.05}s`,
              }}
                onMouseEnter={e=>{
                  e.currentTarget.style.transform="translateX(4px)";
                  e.currentTarget.style.boxShadow=`-4px 0 16px ${dc.color}30, 0 4px 20px rgba(0,0,0,0.5)`;
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.transform="translateX(0)";
                  e.currentTarget.style.boxShadow="none";
                }}
              >
                {/* Header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <h3 style={{ fontWeight:700, color:"#fff", fontSize:"0.95rem", margin:0, flex:1, marginRight:8 }}>
                    {c.title}
                  </h3>
                  <span style={{
                    fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", fontWeight:700,
                    padding:"2px 7px", borderRadius:4,
                    background:dc.bg, border:`1px solid ${dc.border}`, color:dc.color,
                    flexShrink:0, letterSpacing:"0.08em",
                  }}>
                    {dc.icon} {c.difficulty?.toUpperCase()||"?"}
                  </span>
                </div>

                {c.description && (
                  <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.4)", marginBottom:8, lineHeight:1.5 }}>{c.description}</p>
                )}

                {/* Meta row */}
                <div style={{ display:"flex", gap:12, marginBottom:"0.9rem", flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", color:"#ffd700", fontWeight:700 }}>
                    ⭐ +{c.xp} XP
                  </span>
                  {c.deadline && (
                    <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)" }}>⏱ {c.deadline}</span>
                  )}
                  {c.status && (
                    <span style={{ fontSize:"0.6rem", fontFamily:"'Orbitron',sans-serif", color:"rgba(0,255,224,0.5)", textTransform:"uppercase" }}>
                      ● {c.status}
                    </span>
                  )}
                </div>

                {/* XP bar visual */}
                <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:2, marginBottom:"0.9rem", overflow:"hidden" }}>
                  <div style={{
                    height:"100%", width:`${Math.min(c.xp||0,100)}%`,
                    background:`linear-gradient(90deg,${dc.color},${dc.color}aa)`,
                    boxShadow:`0 0 6px ${dc.color}60`,
                    borderRadius:2,
                  }}/>
                </div>

                <button
                  onClick={()=>onJoin(c.id)}
                  disabled={joining===c.id}
                  style={{
                    fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", fontWeight:700,
                    letterSpacing:"0.08em", padding:"0.45rem 1rem", borderRadius:5,
                    background: joining===c.id ? "rgba(255,255,255,0.05)" : dc.bg,
                    border:`1px solid ${dc.border}`, color: joining===c.id ? "rgba(255,255,255,0.3)" : dc.color,
                    cursor: joining===c.id ? "not-allowed" : "pointer",
                    transition:"all 0.2s", width:"100%",
                  }}
                  onMouseEnter={e=>{ if(joining!==c.id){ e.currentTarget.style.boxShadow=`0 0 12px ${dc.color}40`; e.currentTarget.style.transform="translateY(-1px)"; }}}
                  onMouseLeave={e=>{ e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="translateY(0)"; }}
                >
                  {joining===c.id ? "◌ JOINING..." : `${dc.icon} ACCEPT QUEST`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LEADERBOARD TAB
───────────────────────────────────────────────────────── */
function LeaderboardTab({ leaderboard, currentUser }) {
  const myIdx = leaderboard.findIndex(l=>l.employee_id===currentUser?.id);
  const GOLD = { color:"#ffd700", shadow:"0 0 15px rgba(255,215,0,0.7)", bg:"rgba(255,215,0,0.08)", border:"rgba(255,215,0,0.25)" };
  const SLVR = { color:"#c0c0c0", shadow:"0 0 10px rgba(192,192,192,0.4)", bg:"rgba(192,192,192,0.06)", border:"rgba(192,192,192,0.15)" };
  const BRNZ = { color:"#cd7f32", shadow:"0 0 10px rgba(205,127,50,0.4)", bg:"rgba(205,127,50,0.06)", border:"rgba(205,127,50,0.15)" };
  const podium = [GOLD,SLVR,BRNZ];

  return (
    <div>
      {/* Podium top 3 */}
      {leaderboard.length >= 3 && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem", marginBottom:"2rem" }}>
          {[1,0,2].map(rank=>{
            const entry = leaderboard[rank];
            if(!entry) return <div key={rank}/>;
            const p = podium[rank];
            const height = rank===0 ? 140 : rank===1 ? 120 : 100;
            return (
              <div key={rank} style={{
                background:`linear-gradient(180deg,${p.bg},rgba(10,14,26,0.5))`,
                border:`1px solid ${p.border}`, borderRadius:12,
                padding:"1.25rem", textAlign:"center",
                boxShadow:`0 0 20px ${p.bg}`,
                height, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:4,
                transition:"all 0.3s",
              }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 8px 30px ${p.bg}`; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 0 20px ${p.bg}`; }}
              >
                <div style={{ fontSize:rank===0?"2rem":"1.6rem" }}>{RANK_ICONS[rank]}</div>
                <div style={{ fontWeight:700, color:"#fff", fontSize:"0.8rem" }}>{entry.full_name}</div>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem", color:p.color, fontWeight:900, textShadow:p.shadow }}>
                  {entry.xp_points} XP
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
        {leaderboard.map((l,idx)=>{
          const p = podium[idx];
          const isMe = l.employee_id===currentUser?.id;
          return (
            <div key={l.employee_id} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"0.65rem 1rem", borderRadius:8,
              background: isMe ? "rgba(0,255,224,0.07)" : (p?.bg||"rgba(255,255,255,0.02)"),
              border:`1px solid ${isMe ? "rgba(0,255,224,0.25)" : (p?.border||"rgba(255,255,255,0.04)")}`,
              transition:"all 0.2s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background=isMe?"rgba(0,255,224,0.1)":"rgba(255,255,255,0.04)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=isMe?"rgba(0,255,224,0.07)":(p?.bg||"rgba(255,255,255,0.02)"); }}
            >
              <div style={{
                fontFamily:"'Orbitron',sans-serif", fontWeight:900, fontSize:"0.9rem",
                minWidth:32, color: p?.color||"rgba(255,255,255,0.3)", textShadow:p?.shadow||"none",
              }}>
                {idx<3 ? RANK_ICONS[idx] : `${idx+1}`}
              </div>
              <div style={{ flex:1, fontSize:"0.85rem", color: isMe?"#00ffe0":"#cbd5e1", fontWeight:isMe?700:400 }}>
                {l.full_name}
                {isMe && <span style={{ marginLeft:8, fontSize:"0.6rem", fontFamily:"'Orbitron',sans-serif", color:"#00ffe0" }}>(YOU)</span>}
              </div>
              {/* Mini XP bar */}
              <div style={{ width:80, height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
                <div style={{
                  height:"100%",
                  width:`${Math.min((l.xp_points/(leaderboard[0]?.xp_points||1))*100,100)}%`,
                  background: p?.color||"rgba(255,255,255,0.2)",
                  borderRadius:2,
                }}/>
              </div>
              <div style={{
                fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem", fontWeight:700,
                color:p?.color||"rgba(255,255,255,0.3)", textShadow:p?.shadow||"none",
                minWidth:60, textAlign:"right",
              }}>
                {l.xp_points} XP
              </div>
            </div>
          );
        })}
        {leaderboard.length===0 && (
          <div style={{ textAlign:"center", padding:"3rem", color:"rgba(255,215,0,0.25)", fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem" }}>
            NO PLAYERS RANKED YET
          </div>
        )}
      </div>

      {myIdx>=3 && (
        <div style={{
          marginTop:"1rem", padding:"0.75rem 1rem", borderRadius:8,
          background:"rgba(0,255,224,0.05)", border:"1px solid rgba(0,255,224,0.15)",
          display:"flex", alignItems:"center", gap:8,
        }}>
          <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", color:"rgba(0,255,224,0.6)" }}>YOUR RANK:</span>
          <span style={{ fontFamily:"'Orbitron',sans-serif", fontWeight:900, color:"#00ffe0" }}>#{myIdx+1}</span>
          <span style={{ flex:1, fontSize:"0.75rem", color:"rgba(255,255,255,0.4)" }}>{leaderboard[myIdx]?.full_name}</span>
          <span style={{ fontFamily:"'Orbitron',sans-serif", color:"#ffd700" }}>{leaderboard[myIdx]?.xp_points} XP</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   BADGES TAB
───────────────────────────────────────────────────────── */
function BadgesTab({ badges }) {
  return (
    <div>
      {badges.length===0 ? (
        <div style={{ textAlign:"center", padding:"3rem", color:"rgba(168,85,247,0.3)", fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem" }}>
          NO BADGES CONFIGURED YET
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:"1rem" }}>
          {badges.map(b=>(
            <div key={b.id} style={{
              textAlign:"center", padding:"1.5rem 1rem",
              background:"rgba(168,85,247,0.07)",
              border:"1px solid rgba(168,85,247,0.2)",
              borderRadius:12, transition:"all 0.3s", cursor:"default",
            }}
              onMouseEnter={e=>{
                e.currentTarget.style.background="rgba(168,85,247,0.15)";
                e.currentTarget.style.boxShadow="0 0 20px rgba(168,85,247,0.3)";
                e.currentTarget.style.transform="translateY(-4px) scale(1.03)";
                e.currentTarget.style.borderColor="rgba(168,85,247,0.5)";
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.background="rgba(168,85,247,0.07)";
                e.currentTarget.style.boxShadow="none";
                e.currentTarget.style.transform="translateY(0) scale(1)";
                e.currentTarget.style.borderColor="rgba(168,85,247,0.2)";
              }}
            >
              <div style={{ fontSize:"2.5rem", filter:"drop-shadow(0 0 8px rgba(168,85,247,0.7))", marginBottom:8 }}>
                {b.icon||"🏅"}
              </div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", fontWeight:700, color:"#a855f7", letterSpacing:"0.05em", marginBottom:4 }}>
                {b.name}
              </div>
              {b.description && <div style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.35)", lineHeight:1.4 }}>{b.description}</div>}
              {b.xp_value && (
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"#ffd700", marginTop:4 }}>+{b.xp_value} XP</div>
              )}
              {b.unlock_rule && (
                <div style={{ fontSize:"0.6rem", color:"rgba(168,85,247,0.5)", marginTop:4 }}>🔓 {b.unlock_rule}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   REWARDS TAB
───────────────────────────────────────────────────────── */
function RewardsTab({ rewards, userXP, redeeming, onRedeem }) {
  const available = rewards.filter(r=>r.stock>0);
  const oos       = rewards.filter(r=>r.stock===0);

  const RewardCard = ({r})=>{
    const canAfford = userXP >= r.points_required;
    const pct = Math.min((userXP/r.points_required)*100,100);
    return (
      <div style={{
        background:"linear-gradient(135deg,rgba(17,24,39,0.97),rgba(10,14,26,0.99))",
        border:`1px solid ${canAfford ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.06)"}`,
        borderLeft:`3px solid ${canAfford ? "#ffd700" : "rgba(255,255,255,0.1)"}`,
        borderRadius:10, padding:"1.1rem 1.25rem",
        opacity: r.stock===0 ? 0.5 : 1,
        transition:"all 0.3s",
      }}
        onMouseEnter={e=>{ if(r.stock>0){ e.currentTarget.style.transform="translateX(3px)"; e.currentTarget.style.boxShadow=canAfford?"0 0 20px rgba(255,215,0,0.15)":"none"; }}}
        onMouseLeave={e=>{ e.currentTarget.style.transform="translateX(0)"; e.currentTarget.style.boxShadow="none"; }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <div style={{ fontWeight:700, color:"#fff", fontSize:"0.9rem" }}>{r.name}</div>
          {r.stock===0
            ? <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", padding:"2px 6px", borderRadius:4, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)", color:"#ef4444" }}>OUT OF STOCK</span>
            : <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", padding:"2px 6px", borderRadius:4, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", color:"#22c55e" }}>{r.stock} LEFT</span>
          }
        </div>

        {r.description && <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)", marginBottom:8 }}>{r.description}</p>}

        <div style={{ marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:"0.65rem" }}>
            <span style={{ fontFamily:"'Orbitron',sans-serif", color:"rgba(255,215,0,0.7)" }}>⭐ {r.points_required} pts required</span>
            <span style={{ color: canAfford?"#22c55e":"rgba(239,68,68,0.7)" }}>
              {canAfford ? "✓ CAN AFFORD" : `Need ${r.points_required-userXP} more`}
            </span>
          </div>
          <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
            <div style={{
              height:"100%", width:`${pct}%`,
              background: canAfford ? "linear-gradient(90deg,#ffd700,#f97316)" : "linear-gradient(90deg,#ef4444,#dc2626)",
              boxShadow: canAfford ? "0 0 6px rgba(255,215,0,0.5)" : "none",
              borderRadius:3, transition:"width 1s ease-out",
            }}/>
          </div>
        </div>

        <button
          onClick={()=>onRedeem(r.id,r.name)}
          disabled={redeeming===r.id||r.stock===0||!canAfford}
          style={{
            fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", fontWeight:700,
            letterSpacing:"0.08em", padding:"0.45rem 1rem", borderRadius:5,
            width:"100%", cursor:(r.stock===0||!canAfford||redeeming===r.id)?"not-allowed":"pointer",
            background: canAfford&&r.stock>0 ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)",
            border:`1px solid ${canAfford&&r.stock>0 ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.08)"}`,
            color: canAfford&&r.stock>0 ? "#ffd700" : "rgba(255,255,255,0.2)",
            opacity:(redeeming===r.id)?0.6:1,
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>{ if(canAfford&&r.stock>0&&redeeming!==r.id){ e.currentTarget.style.boxShadow="0 0 12px rgba(255,215,0,0.3)"; e.currentTarget.style.transform="translateY(-1px)"; }}}
          onMouseLeave={e=>{ e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="translateY(0)"; }}
        >
          {redeeming===r.id ? "◌ CLAIMING..." : "🎁 CLAIM REWARD"}
        </button>
      </div>
    );
  };

  return (
    <div>
      {available.length>0 && (
        <>
          <div className="section-title" style={{ color:"rgba(255,215,0,0.7)", marginBottom:"1rem" }}>
            <span>🎁</span> Available Rewards
            <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(255,215,0,0.3),transparent)" }}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
            {available.map(r=><RewardCard key={r.id} r={r}/>)}
          </div>
        </>
      )}
      {oos.length>0 && (
        <>
          <div className="section-title" style={{ color:"rgba(239,68,68,0.5)", marginBottom:"1rem" }}>
            <span>🚫</span> Out of Stock
            <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(239,68,68,0.2),transparent)" }}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" }}>
            {oos.map(r=><RewardCard key={r.id} r={r}/>)}
          </div>
        </>
      )}
      {rewards.length===0 && (
        <div style={{ textAlign:"center", padding:"3rem", color:"rgba(255,215,0,0.25)", fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem" }}>
          NO REWARDS IN CATALOG YET
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN GAMIFICATION PAGE
───────────────────────────────────────────────────────── */
export default function Gamification() {
  const { user } = useAuth();
  const [entered, setEntered] = useState(false);
  const [entering, setEntering] = useState(false); // flash transition
  const [challenges, setChallenges] = useState([]);
  const [badges, setBadges]         = useState([]);
  const [rewards, setRewards]       = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tab, setTab]               = useState("quests");
  const [joining, setJoining]       = useState(null);
  const [redeeming, setRedeeming]   = useState(null);
  const [toast, setToast]           = useState(null);

  const load = useCallback(async () => {
    const [c,b,r,l] = await Promise.all([
      api.get("/gamification/challenges", { params:{ status:"active" } }),
      api.get("/gamification/badges"),
      api.get("/gamification/rewards"),
      api.get("/gamification/leaderboard"),
    ]);
    setChallenges(c.data); setBadges(b.data);
    setRewards(r.data);    setLeaderboard(l.data);
  },[]);

  useEffect(()=>{ load(); },[load]);

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3500);
  };

  const handleEnter = () => {
    setEntering(true);
    setTimeout(()=>{ setEntered(true); setEntering(false); }, 300);
  };

  const join = async (id) => {
    setJoining(id);
    try {
      await api.post("/gamification/challenge-participations",{challenge_id:id});
      showToast("⚡ Quest accepted! Go prove your worth.");
    } catch(e) {
      showToast(e.response?.data?.detail||"Could not join","error");
    } finally { setJoining(null); }
  };

  const redeem = async (id, name) => {
    setRedeeming(id);
    try {
      const res = await api.post(`/gamification/rewards/${id}/redeem`);
      showToast(`🏆 "${name}" claimed! ${res.data.remaining_points} pts remaining.`);
      load();
    } catch(e) {
      showToast(e.response?.data?.detail||"Could not redeem","error");
    } finally { setRedeeming(null); }
  };

  const xp    = user?.xp_points ?? 0;
  const level = Math.floor(xp/100)+1;
  const xpInLevel = xp % 100;

  const TABS = [
    { key:"quests",      icon:"⚔",  label:"Quests",      count:challenges.length },
    { key:"leaderboard", icon:"🏆",  label:"Leaderboard", count:leaderboard.length },
    { key:"badges",      icon:"🎖",  label:"Badges",      count:badges.length },
    { key:"rewards",     icon:"🎁",  label:"Rewards",     count:rewards.length },
  ];

  /* Lobby */
  if (!entered) {
    return (
      <div style={{ opacity: entering ? 0 : 1, transition:"opacity 0.3s" }}>
        <ArenaLobby user={user} onEnter={handleEnter} />
      </div>
    );
  }

  /* Arena */
  return (
    <Layout>
      <Toast toast={toast}/>
      <div className="page-enter">
        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"2rem", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"rgba(255,215,0,0.5)", letterSpacing:"0.2em", marginBottom:4 }}>
              ▶ SUSTAINABILITY ARENA · LIVE
            </div>
            <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.4rem", fontWeight:900, color:"#fff", margin:0 }}>
              🏆 <span style={{ color:"#ffd700", textShadow:"0 0 15px rgba(255,215,0,0.6)" }}>GAME</span> BOARD
            </h1>
          </div>
          <button
            onClick={()=>setEntered(false)}
            style={{
              fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", fontWeight:700,
              padding:"0.45rem 0.9rem", borderRadius:5,
              background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)",
              color:"rgba(255,255,255,0.3)", cursor:"pointer", letterSpacing:"0.08em",
              transition:"all 0.2s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.color="#00ffe0"; e.currentTarget.style.borderColor="rgba(0,255,224,0.3)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.color="rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; }}
          >
            ← LOBBY
          </button>
        </div>

        {/* Player HUD */}
        <div style={{
          display:"grid", gridTemplateColumns:"auto 1fr repeat(3,auto)", gap:"1.5rem",
          alignItems:"center", padding:"1.25rem 1.5rem", marginBottom:"2rem",
          background:"linear-gradient(135deg,rgba(17,24,39,0.97),rgba(10,14,26,0.99))",
          border:"1px solid rgba(255,215,0,0.2)",
          borderRadius:12,
          boxShadow:"0 0 30px rgba(255,215,0,0.05)",
        }}>
          {/* Avatar */}
          <div style={{
            width:56, height:56, borderRadius:"50%",
            background:"linear-gradient(135deg,#ffd700,#f97316)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"1.4rem", fontWeight:900, color:"#0a0e1a",
            boxShadow:"0 0 20px rgba(255,215,0,0.4)",
            border:"2px solid rgba(255,215,0,0.5)",
            position:"relative", flexShrink:0,
          }}>
            {user?.full_name?.[0]??"?"}
            <div style={{
              position:"absolute", bottom:-6, right:-6,
              background:"#ffd700", color:"#0a0e1a",
              fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", fontWeight:900,
              padding:"2px 4px", borderRadius:3,
            }}>LV.{level}</div>
          </div>

          {/* XP */}
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontWeight:700, color:"#fff", marginBottom:2 }}>{user?.full_name}</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ fontSize:"0.6rem", color:"rgba(255,215,0,0.5)", fontFamily:"'Orbitron',sans-serif" }}>XP</span>
              <div style={{ flex:1, maxWidth:200, height:6, background:"rgba(255,215,0,0.1)", borderRadius:3, border:"1px solid rgba(255,215,0,0.15)", overflow:"hidden" }}>
                <div style={{
                  height:"100%", width:`${xpInLevel}%`,
                  background:"linear-gradient(90deg,#ffd700,#f97316,#ffd700)",
                  backgroundSize:"200% 100%",
                  animation:"shimmer 2s linear infinite",
                  boxShadow:"0 0 6px rgba(255,215,0,0.5)",
                  borderRadius:3, transition:"width 1s ease-out",
                }}/>
              </div>
              <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", color:"#ffd700", fontWeight:700 }}>
                <XPCounter value={xp}/> XP
              </span>
            </div>
            <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)" }}>{user?.role} · {xpInLevel}/100 to next level</div>
          </div>

          {/* Quick stats */}
          {[
            { label:"Quests", value:challenges.length, color:"#00ffe0" },
            { label:"Badges", value:badges.length, color:"#a855f7" },
            { label:"Rewards", value:rewards.filter(r=>r.stock>0).length, color:"#ffd700" },
          ].map(s=>(
            <div key={s.label} style={{ textAlign:"center", padding:"0.5rem 1rem", borderRadius:8, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.3rem", fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.35)", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.75rem", borderBottom:"1px solid rgba(0,255,224,0.1)", paddingBottom:"0.5rem" }}>
          {TABS.map(t=>{
            const active = tab===t.key;
            return (
              <button key={t.key} onClick={()=>setTab(t.key)} style={{
                fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", fontWeight:700,
                letterSpacing:"0.08em", padding:"0.55rem 1.1rem", borderRadius:"6px 6px 0 0",
                cursor:"pointer", transition:"all 0.2s",
                background: active ? "rgba(0,255,224,0.1)" : "transparent",
                border: active ? "1px solid rgba(0,255,224,0.3)" : "1px solid transparent",
                borderBottom: active ? "2px solid #00ffe0" : "1px solid transparent",
                color: active ? "#00ffe0" : "rgba(255,255,255,0.35)",
                boxShadow: active ? "0 0 12px rgba(0,255,224,0.1)" : "none",
                marginBottom:"-1px",
              }}>
                {t.icon} {t.label}
                {t.count>0 && (
                  <span style={{
                    marginLeft:6, fontSize:"0.55rem",
                    background: active?"rgba(0,255,224,0.15)":"rgba(255,255,255,0.07)",
                    color: active?"#00ffe0":"rgba(255,255,255,0.3)",
                    padding:"1px 5px", borderRadius:10,
                  }}>{t.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ animation:"fadeUp 0.35s ease-out" }}>
          {tab==="quests"      && <QuestsTab      challenges={challenges} joining={joining} onJoin={join}/>}
          {tab==="leaderboard" && <LeaderboardTab leaderboard={leaderboard} currentUser={user}/>}
          {tab==="badges"      && <BadgesTab      badges={badges}/>}
          {tab==="rewards"     && <RewardsTab     rewards={rewards} userXP={xp} redeeming={redeeming} onRedeem={redeem}/>}
        </div>
      </div>
    </Layout>
  );
}
