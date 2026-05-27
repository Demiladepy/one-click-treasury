import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        foreground: "#FAFAFA",
        muted: "#A1A1AA",
        border: "rgba(255, 255, 255, 0.08)",
        card: "rgba(255, 255, 255, 0.03)",
        surface: "#13131A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-inter-tight)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, #FF6B9D 0%, #F0B90B 100%)",
      },
      boxShadow: {
        glow: "inset 0 0 20px rgba(153, 69, 255, 0.2)",
        "glow-hover":
          "inset 0 0 24px rgba(153, 69, 255, 0.25), 0 8px 32px rgba(0, 0, 0, 0.4)",
        "card-hover":
          "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(153, 69, 255, 0.1)",
      },
      animation: {
        "gradient-sweep": "gradient-sweep 3s ease infinite",
      },
      keyframes: {
        "gradient-sweep": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
