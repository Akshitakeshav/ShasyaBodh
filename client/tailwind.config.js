/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agBg: "#0A0F0A",
        agCard: "#111811",
        agPrimary: "#22C55E",
        agAmber: "#F59E0B",
        agOled: "#00FF41",
        agRed: "#EF4444",
        earth: '#584c33',
        straw: '#f5e7b8',
        agMuted: "#4B5563"
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        serifDisplay: ["'DM Serif Display'", "serif"]
      },
      boxShadow: {
        agCard: "0 0 20px rgba(34, 197, 94, 0.05)",
        oledGlow: "0 0 15px rgba(0, 255, 65, 0.25)",
        pulseGlow: "0 0 10px rgba(34, 197, 94, 0.5)"
      }
    },
  },
  plugins: [],
}
