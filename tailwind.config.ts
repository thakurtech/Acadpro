import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#08080f",
          surface: "#0f0f1a",
          card: "#15152a",
          hover: "#1c1c35",
          border: "#1e1e3a",
        },
        accent: {
          DEFAULT: "#7c3aed",
          dim: "#5b21b6",
          glow: "#a855f7",
          soft: "#2e1065",
        },
        electric: {
          blue: "#3b82f6",
          cyan: "#06b6d4",
          green: "#10b981",
          yellow: "#f59e0b",
          red: "#ef4444",
          pink: "#ec4899",
          orange: "#f97316",
        },
        ink: {
          primary: "#f0f0ff",
          secondary: "#94a3b8",
          muted: "#475569",
          faint: "#1e293b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "glow-purple": "radial-gradient(ellipse at center, #7c3aed22 0%, transparent 70%)",
        "glow-blue": "radial-gradient(ellipse at center, #3b82f622 0%, transparent 70%)",
        "gradient-card": "linear-gradient(135deg, #15152a 0%, #0f0f1a 100%)",
      },
      boxShadow: {
        "glow-sm": "0 0 15px rgba(124, 58, 237, 0.25)",
        "glow-md": "0 0 30px rgba(124, 58, 237, 0.35)",
        "glow-lg": "0 0 60px rgba(124, 58, 237, 0.4)",
        card: "0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-right": "slideRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideRight: { from: { opacity: "0", transform: "translateX(-12px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(124,58,237,0.25)" },
          "50%": { boxShadow: "0 0 35px rgba(124,58,237,0.5)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
