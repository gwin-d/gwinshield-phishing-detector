/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:    "#0D1B3E",
        primary: "#1565C0",
        cyan:    "#00B4D8",
        safe:    "#00C896",
        danger:  "#FF3B3B",
        warning: "#F4A261",
        card:    "#111827",
        muted:   "#94A3B8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float":       "float 6s ease-in-out infinite",
        "glow":        "glow 2s ease-in-out infinite alternate",
        "count-up":    "countUp 1s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-20px)" },
        },
        glow: {
          "0%":   { boxShadow: "0 0 5px #00B4D8" },
          "100%": { boxShadow: "0 0 25px #00B4D8, 0 0 50px #1565C0" },
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0,180,216,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.05) 1px, transparent 1px)",
        "hero-gradient": "radial-gradient(ellipse at top, #1565C0 0%, #0D1B3E 50%, #000000 100%)",
      },
      backgroundSize: {
        "grid": "50px 50px",
      },
    },
  },
  plugins: [],
}