import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        wahaj: {
          primary: "#D89CA4",
          rose: "#B76E79",
          soft: "#F3D6D9",
          bg: "#FFF9F7",
          card: "#F8ECEB",
          text: "#6B4E4E",
          border: "#E8D6D6",
          success: "#8FAF9A",
          warning: "#D8A48F",
          stars: "#E0B56A",
          ink: "#3D2D2D",
          ivory: "#FFFCFA"
        }
      },
      boxShadow: {
        satin: "0 18px 60px rgba(183, 110, 121, 0.18)",
        glow: "0 0 34px rgba(216, 156, 164, 0.32)",
        soft: "0 12px 34px rgba(107, 78, 78, 0.10)"
      },
      backgroundImage: {
        satin:
          "radial-gradient(circle at 18% 18%, rgba(255,255,255,.96), transparent 28%), radial-gradient(circle at 80% 0%, rgba(216,156,164,.28), transparent 34%), linear-gradient(135deg, #FFF9F7 0%, #F8ECEB 48%, #FFFDFB 100%)",
        "rose-lux":
          "linear-gradient(135deg, rgba(216,156,164,.96) 0%, rgba(183,110,121,.96) 100%)"
      },
      fontFamily: {
        sans: ["var(--font-thmanyah-sans)", "Arial", "sans-serif"],
        thmanyah: ["var(--font-thmanyah-sans)", "Arial", "sans-serif"],
        display: ["var(--font-thmanyah-serif-display)", "Times New Roman", "serif"],
        "thmanyah-display": ["var(--font-thmanyah-serif-display)", "Times New Roman", "serif"],
        cairo: ["var(--font-thmanyah-sans)", "Arial", "sans-serif"],
        plex: ["var(--font-thmanyah-sans)", "Arial", "sans-serif"],
        alexandria: ["var(--font-thmanyah-serif-display)", "Times New Roman", "serif"]
      },
      fontSize: {
        "wahaj-hero": ["clamp(2.5rem, 7vw, 4.5rem)", { lineHeight: "1.1", fontWeight: "500" }],
        "wahaj-section": ["clamp(1.8rem, 5vw, 3rem)", { lineHeight: "1.2", fontWeight: "500" }],
        "wahaj-product": ["1rem", { lineHeight: "1.5", fontWeight: "500" }],
        "wahaj-description": ["0.95rem", { lineHeight: "1.8", fontWeight: "400" }],
        "wahaj-nav": ["0.95rem", { lineHeight: "1.7", fontWeight: "500" }]
      }
    }
  },
  plugins: []
};

export default config;
