import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path: "/",               icon: "⬡",  label: "Dashboard"     },
  { path: "/environmental",  icon: "🌿",  label: "Environmental" },
  { path: "/social",         icon: "🤝",  label: "Social"        },
  { path: "/governance",     icon: "⚖️",  label: "Governance"    },
  { path: "/gamification",   icon: "🎮",  label: "Game Arena"    },
  { path: "/reports",        icon: "📊",  label: "Intel Reports" },
];

const STAR_COUNT = 18;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  top:   `${Math.random() * 100}%`,
  left:  `${Math.random() * 100}%`,
  size:  Math.random() * 3 + 1.5,
  dur:   `${Math.random() * 5 + 3}s`,
  opacity: Math.random() * 0.25 + 0.1,
  delay: `${Math.random() * 4}s`,
  color: ["#06b6d4","#6366f1","#d97706","#16a34a"][Math.floor(Math.random()*4)],
}));

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const xp      = user?.xp_points ?? 0;
  const level   = Math.floor(xp / 100) + 1;
  const xpInLvl = xp % 100;

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", position: "relative" }}>

      {/* Floating particles in background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {stars.map(s => (
          <div key={s.id} className="star" style={{
            top: s.top, left: s.left,
            width: s.size, height: s.size,
            background: s.color,
            "--dur": s.dur, "--opacity": s.opacity,
            animationDelay: s.delay,
            filter: "blur(0.5px)",
          }} />
        ))}
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
      </div>

      {/* ── Sidebar ── */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        width: collapsed ? 64 : 220,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(99,102,241,0.1)",
        boxShadow: "2px 0 24px rgba(99,102,241,0.08)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? "1.25rem 0" : "1.25rem 1rem",
          borderBottom: "1px solid rgba(99,102,241,0.08)",
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: 64,
        }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: "linear-gradient(135deg,#06b6d4,#6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", boxShadow: "0 4px 12px rgba(6,182,212,0.3)",
              }}>🌍</div>
              <div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem", fontWeight: 900, color: "#0f172a", letterSpacing: "0.05em" }}>
                  ECOSPHERE
                </div>
                <div style={{ fontSize: "0.5rem", color: "var(--text-muted)", fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.1em" }}>
                  ESG PLATFORM
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: "linear-gradient(135deg,#06b6d4,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem",
            }}>🌍</div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{
            background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)",
            borderRadius: 5, width: 24, height: 24, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.6rem", color: "var(--text-muted)", transition: "all 0.2s", flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.15)"; e.currentTarget.style.color = "#06b6d4"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.07)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* Player card */}
        {!collapsed && (
          <div style={{
            margin: "0.75rem", padding: "0.75rem",
            background: "linear-gradient(135deg,rgba(6,182,212,0.08),rgba(99,102,241,0.06))",
            border: "1px solid rgba(6,182,212,0.15)", borderRadius: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg,#06b6d4,#6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: "0.85rem", color: "#fff",
                boxShadow: "0 2px 8px rgba(6,182,212,0.3)",
                flexShrink: 0,
              }}>
                {user?.full_name?.[0] ?? "?"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontWeight: 600, fontSize: "0.75rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.full_name}
                </div>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "'Orbitron',sans-serif" }}>
                  Lv.{level} · {user?.role}
                </div>
              </div>
            </div>
            {/* XP bar */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.55rem", color: "var(--text-muted)", fontFamily: "'Orbitron',sans-serif", marginBottom: 3 }}>
                <span>XP PROGRESS</span>
                <span style={{ color: "#0891b2", fontWeight: 700 }}>{xp} pts</span>
              </div>
              <div className="xp-bar-track">
                <div className="xp-bar-fill" style={{ width: `${xpInLvl}%` }} />
              </div>
              <div style={{ fontSize: "0.5rem", color: "var(--text-muted)", marginTop: 3, fontFamily: "'Orbitron',sans-serif" }}>
                {xpInLvl}/100 to Level {level + 1}
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: collapsed ? "0.5rem 0.35rem" : "0.5rem 0.5rem", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? "0.65rem" : "0.6rem 0.85rem",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 8,
                  background: active
                    ? "linear-gradient(135deg,rgba(6,182,212,0.15),rgba(99,102,241,0.1))"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(6,182,212,0.25)"
                    : "1px solid transparent",
                  color: active ? "#0891b2" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400,
                  fontSize: "0.82rem",
                  transition: "all 0.2s",
                  boxShadow: active ? "0 2px 10px rgba(6,182,212,0.1)" : "none",
                  cursor: "pointer",
                }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                      e.currentTarget.style.color = "#0891b2";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && (
                    <span style={{ fontFamily: active ? "'Orbitron',sans-serif" : "'Inter',sans-serif", fontSize: active ? "0.65rem" : "0.82rem", letterSpacing: active ? "0.06em" : 0 }}>
                      {item.label}
                    </span>
                  )}
                  {active && !collapsed && (
                    <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#06b6d4", boxShadow: "0 0 8px rgba(6,182,212,0.6)" }} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Admin + Logout */}
        <div style={{ padding: collapsed ? "0.5rem 0.35rem" : "0.5rem", borderTop: "1px solid rgba(99,102,241,0.08)", display: "flex", flexDirection: "column", gap: 4 }}>
          {(user?.role === "admin" || user?.role === "department_head") && (
            <Link to="/admin" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "0.65rem" : "0.6rem 0.85rem",
                borderRadius: 8,
                background: location.pathname === "/admin" ? "rgba(217,119,6,0.1)" : "transparent",
                border: location.pathname === "/admin" ? "1px solid rgba(217,119,6,0.25)" : "1px solid transparent",
                color: location.pathname === "/admin" ? "#d97706" : "var(--text-muted)",
                fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s",
              }}>
                <span style={{ fontSize: "1rem" }}>⚙️</span>
                {!collapsed && <span>Admin</span>}
              </div>
            </Link>
          )}
          <div onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0.65rem" : "0.6rem 0.85rem",
            borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
            color: "var(--text-muted)", fontSize: "0.82rem",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.08)"; e.currentTarget.style.color = "#dc2626"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <span style={{ fontSize: "1rem" }}>🚪</span>
            {!collapsed && <span>Logout</span>}
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{
        marginLeft: collapsed ? 64 : 220,
        flex: 1, padding: "2rem",
        position: "relative", zIndex: 1,
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        minHeight: "100vh",
      }}>
        {children}
      </main>
    </div>
  );
}
