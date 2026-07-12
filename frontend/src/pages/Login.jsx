import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  top:     `${Math.random() * 100}%`,
  left:    `${Math.random() * 100}%`,
  size:    Math.random() * 4 + 1.5,
  dur:     `${Math.random() * 5 + 3}s`,
  opacity: Math.random() * 0.3 + 0.08,
  delay:   `${Math.random() * 5}s`,
  color:   ["#06b6d4","#6366f1","#d97706","#16a34a"][Math.floor(Math.random()*4)],
}));

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState("admin@ecosphere.io");
  const [password, setPassword] = useState("Admin123!");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setScanLine(p => (p + 1) % 100), 30);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0f2fe 0%, #f0f4ff 40%, #faf5ff 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Particles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        {PARTICLES.map(p => (
          <div key={p.id} className="star" style={{
            top: p.top, left: p.left,
            width: p.size, height: p.size,
            background: p.color,
            "--dur": p.dur, "--opacity": p.opacity,
            animationDelay: p.delay,
          }} />
        ))}
      </div>

      {/* Grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Scan line */}
      <div style={{
        position: "fixed", left: 0, right: 0,
        top: `${scanLine}%`, height: "2px",
        background: "linear-gradient(90deg,transparent,rgba(6,182,212,0.2),transparent)",
        pointerEvents: "none",
        transition: "top 0.03s linear",
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: 420,
        padding: "2rem",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(6,182,212,0.2)",
        borderRadius: 18,
        boxShadow: "0 8px 40px rgba(99,102,241,0.12), 0 2px 12px rgba(6,182,212,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
        animation: "fadeUp 0.6s ease-out",
      }}>
        {/* Corner brackets */}
        {[
          {top:0,left:0,borderTop:"2px solid #06b6d4",borderLeft:"2px solid #06b6d4",borderRadius:"6px 0 0 0"},
          {top:0,right:0,borderTop:"2px solid #06b6d4",borderRight:"2px solid #06b6d4",borderRadius:"0 6px 0 0"},
          {bottom:0,left:0,borderBottom:"2px solid #06b6d4",borderLeft:"2px solid #06b6d4",borderRadius:"0 0 0 6px"},
          {bottom:0,right:0,borderBottom:"2px solid #06b6d4",borderRight:"2px solid #06b6d4",borderRadius:"0 0 6px 0"},
        ].map((s,i)=>(
          <div key={i} style={{ position:"absolute",width:20,height:20,...s }}/>
        ))}

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"1.75rem" }}>
          <div className="animate-float" style={{ fontSize:"3rem", display:"block", marginBottom:"0.5rem" }}>🌍</div>
          <div style={{
            fontFamily:"'Orbitron',sans-serif", fontSize:"1.5rem", fontWeight:900,
            background:"linear-gradient(135deg,#06b6d4,#6366f1)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            letterSpacing:"0.08em",
          }}>ECOSPHERE</div>
          <div style={{ fontSize:"0.6rem", color:"var(--text-muted)", letterSpacing:"0.2em", fontFamily:"'Orbitron',sans-serif", marginTop:4 }}>
            ESG · GAME BOARD · v2.0
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background:"rgba(220,38,38,0.07)", border:"1px solid rgba(220,38,38,0.25)",
            color:"#dc2626", padding:"0.6rem 0.75rem", borderRadius:8, marginBottom:"1rem",
            fontSize:"0.8rem", display:"flex", alignItems:"center", gap:8,
          }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div>
            <label style={{ fontSize:"0.6rem", color:"#0891b2", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6, fontWeight:700 }}>
              ▶ Player ID (Email)
            </label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              className="game-input" required placeholder="enter@email.io" />
          </div>
          <div>
            <label style={{ fontSize:"0.6rem", color:"#0891b2", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6, fontWeight:700 }}>
              ▶ Access Code
            </label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              className="game-input" required placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="game-btn"
            style={{ width:"100%", padding:"0.75rem", marginTop:"0.25rem", fontSize:"0.8rem", opacity:loading?0.6:1 }}>
            {loading ? "◌ AUTHENTICATING..." : "⚡ ENTER GAME"}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop:"1.25rem", padding:"0.85rem", background:"rgba(6,182,212,0.05)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:10 }}>
          <div style={{ fontSize:"0.58rem", color:"#0891b2", fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.12em", marginBottom:8, fontWeight:700 }}>
            DEMO PLAYERS
          </div>
          {[
            ["ADMIN",    "admin@ecosphere.io",    "Admin123!"],
            ["DEPT HEAD","head.eng@ecosphere.io", "Head123!"],
            ["EMPLOYEE", "raj@ecosphere.io",      "Employee123!"],
          ].map(([role,em,pw])=>(
            <button key={role} onClick={()=>{ setEmail(em); setPassword(pw); }}
              style={{
                display:"block", width:"100%", textAlign:"left",
                background:"none", border:"none", cursor:"pointer",
                color:"#0891b2", fontSize:"0.72rem", padding:"3px 0",
                fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.04em",
                transition:"color 0.2s",
              }}
              onMouseEnter={e=>e.currentTarget.style.color="#6366f1"}
              onMouseLeave={e=>e.currentTarget.style.color="#0891b2"}
            >
              [{role}] {em}
            </button>
          ))}
        </div>

        <p style={{ textAlign:"center", marginTop:"1.1rem", fontSize:"0.75rem", color:"var(--text-muted)" }}>
          New player?{" "}
          <Link to="/signup" style={{ color:"#0891b2", fontWeight:600, textDecoration:"none" }}>
            Create Account →
          </Link>
        </p>
      </div>
    </div>
  );
}
