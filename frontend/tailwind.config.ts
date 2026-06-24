import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0b1437",
          800: "#111c44",
          700: "#1b254b",
        },
        // severity scale
        sev: {
          mild: "#22c55e",
          moderate: "#eab308",
          severe: "#f97316",
          extreme: "#ef4444",
          lethal: "#7f1d1d",
        },
        unlisted: "#f59e0b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
