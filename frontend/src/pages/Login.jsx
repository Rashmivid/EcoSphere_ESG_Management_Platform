import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

// Animated background particles
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 1,
  dur: `${Math.random() * 5 + 3}s`,
  opacity: Math.random() * 0.5 + 0.1,
  delay: `${Math.random() * 5}s`,
}));

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@ecosphere.io");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      background: "radial-gradient(ellipse at center, #0d1527 0%, #060911 70%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Star field */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        {PARTICLES.map(p => (
          <div key={p.id} className="star" style={{
            top: p.top, left: p.left,
            width: p.size, height: p.size,
            "--dur": p.dur, "--opacity": p.opacity,
            animationDelay: p.delay,
          }} />
        ))}
      </div>

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(0,255,224,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,224,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Scan line effect */}
      <div style={{
        position: "fixed", left: 0, right: 0,
        top: `${scanLine}%`, height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(0,255,224,0.15), transparent)",
        pointerEvents: "none",
        transition: "top 0.03s linear",
      }} />

      {/* Login Card */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: 400,
        padding: "2rem",
        background: "linear-gradient(135deg, rgba(17,24,39,0.97) 0%, rgba(6,9,17,0.99) 100%)",
        border: "1px solid rgba(0,255,224,0.2)",
        borderRadius: 16,
        boxShadow: "0 0 40px rgba(0,255,224,0.1), 0 0 80px rgba(0,255,224,0.05), inset 0 1px 0 rgba(0,255,224,0.1)",
        animation: "fadeUp 0.6s ease-out",
      }}>
        {/* Top corner decorations */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 20, height: 20, borderTop: "2px solid #00ffe0", borderLeft: "2px solid #00ffe0", borderRadius: "4px 0 0 0" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 20, height: 20, borderTop: "2px solid #00ffe0", borderRight: "2px solid #00ffe0", borderRadius: "0 4px 0 0" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: 20, height: 20, borderBottom: "2px solid #00ffe0", borderLeft: "2px solid #00ffe0", borderRadius: "0 0 0 4px" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderBottom: "2px solid #00ffe0", borderRight: "2px solid #00ffe0", borderRadius: "0 0 4px 0" }} />

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="animate-float" style={{ fontSize: "3rem", display: "block", marginBottom: "0.5rem" }}>🌍</div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "1.4rem",
            fontWeight: 900,
            color: "#00ffe0",
            textShadow: "0 0 20px rgba(0,255,224,0.8), 0 0 40px rgba(0,255,224,0.3)",
            letterSpacing: "0.1em",
          }}>ECOSPHERE</div>
          <div style={{ fontSize: "0.65rem", color: "rgba(0,255,224,0.5)", letterSpacing: "0.2em", fontFamily: "'Orbitron',sans-serif", marginTop: 4 }}>
            ESG · GAME BOARD · v2.0
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444", padding: "0.6rem 0.75rem", borderRadius: 6, marginBottom: "1rem",
            fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 8,
          }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.65rem", color: "rgba(0,255,224,0.6)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              ▶ PLAYER ID (Email)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="game-input"
              required
              placeholder="enter@email.io"
            />
          </div>
          <div>
            <label style={{ fontSize: "0.65rem", color: "rgba(0,255,224,0.6)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              ▶ ACCESS CODE
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="game-input"
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="game-btn"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem", fontSize: "0.8rem", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "◌ AUTHENTICATING..." : "⚡ ENTER GAME"}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop: "1.5rem", padding: "0.75rem", background: "rgba(0,255,224,0.04)", border: "1px solid rgba(0,255,224,0.1)", borderRadius: 8 }}>
          <div style={{ fontSize: "0.6rem", color: "rgba(0,255,224,0.5)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em", marginBottom: 6 }}>DEMO PLAYERS</div>
          {[
            ["ADMIN", "admin@ecosphere.io", "Admin123!"],
            ["DEPT HEAD", "head.eng@ecosphere.io", "Head123!"],
            ["EMPLOYEE", "raj@ecosphere.io", "Employee123!"],
          ].map(([role, em, pw]) => (
            <button key={role} onClick={() => { setEmail(em); setPassword(pw); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "rgba(0,255,224,0.6)", fontSize: "0.7rem", padding: "2px 0", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.05em" }}>
              [{role}] {em}
            </button>
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
          New player?{" "}
          <Link to="/signup" style={{ color: "#00ffe0", fontWeight: 600 }}>
            Create Account →
          </Link>
        </p>
      </div>
    </div>
  );
}
