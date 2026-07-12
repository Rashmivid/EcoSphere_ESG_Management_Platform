/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        eco: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          900: "#14532d",
        },
        game: {
          bg:      "#0a0e1a",
          panel:   "#111827",
          border:  "#1e2d40",
          neon:    "#00ffe0",
          gold:    "#ffd700",
          purple:  "#a855f7",
          orange:  "#f97316",
          blue:    "#3b82f6",
          red:     "#ef4444",
          green:   "#22c55e",
          dark:    "#060911",
        },
      },
      fontFamily: {
        game: ["'Orbitron'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        neon:   "0 0 20px rgba(0,255,224,0.4), 0 0 40px rgba(0,255,224,0.1)",
        gold:   "0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,215,0,0.1)",
        purple: "0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.1)",
        red:    "0 0 20px rgba(239,68,68,0.4)",
        panel:  "0 4px 24px rgba(0,0,0,0.6)",
      },
      animation: {
        "pulse-slow":  "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "float":       "float 6s ease-in-out infinite",
        "glow":        "glow 2s ease-in-out infinite alternate",
        "slide-in":    "slideIn 0.4s ease-out",
        "fade-up":     "fadeUp 0.5s ease-out",
        "spin-slow":   "spin 8s linear infinite",
        "bounce-slow": "bounce 2s infinite",
        "shimmer":     "shimmer 2s linear infinite",
        "xp-fill":     "xpFill 1s ease-out forwards",
      },
      keyframes: {
        float:    { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        glow:     { "from": { boxShadow: "0 0 10px rgba(0,255,224,0.3)" }, "to": { boxShadow: "0 0 30px rgba(0,255,224,0.8), 0 0 60px rgba(0,255,224,0.3)" } },
        slideIn:  { "from": { transform: "translateX(-20px)", opacity: "0" }, "to": { transform: "translateX(0)", opacity: "1" } },
        fadeUp:   { "from": { transform: "translateY(20px)", opacity: "0" }, "to": { transform: "translateY(0)", opacity: "1" } },
        shimmer:  { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        xpFill:   { "from": { width: "0%" }, "to": { width: "var(--xp-width)" } },
      },
      backgroundImage: {
        "grid-game": "linear-gradient(rgba(0,255,224,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,224,0.05) 1px, transparent 1px)",
        "hex-pattern": "radial-gradient(circle at 25% 25%, rgba(0,255,224,0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168,85,247,0.05) 0%, transparent 50%)",
      },
      backgroundSize: {
        "grid-40": "40px 40px",
      },
    },
  },
  plugins: [],
};
