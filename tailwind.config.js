/** @type {import('tailwindcss').Config} */
export default {
  content:[
    "./index.html", 
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg:      "#FDFCF9", // Alabaster white
        surface: "#FFFFFF",
        navy:    "#0B172A", // Deep Oxford Blue
        gold:    "#A68A56", // Antique Gold
        teal:    "#175855", // Deep Academic Teal
        border:  "#E6E4DE", // Soft warm gray for borders
        muted:   "#64748B",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "serif"],
        sans:  ["'Inter'", "sans-serif"],
        mono:["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        }
      },
      animation: {
        fadeUp: "fadeUp 0.8s ease both",
      },
    },
  },
  plugins:[],
};