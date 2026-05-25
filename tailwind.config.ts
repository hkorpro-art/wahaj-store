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
        brand: {
          burgundy: "#450006",
          "burgundy-deep": "#2D0004",
          champagne: "#D9C4A0",
          gold: "#C9A962",
          "gold-soft": "#E8DCC4",
          beige: "#F3E1E4",
          sand: "#EDE6DC",
          ivory: "#FFFCF8",
          ink: "#2A1215",
          muted: "#6E5254",
          border: "#E0D4C8"
        },
        wahaj: {
          primary: "#D9C4A0",
          rose: "#450006",
          soft: "#F0E6DC",
          bg: "#F3E1E4",
          card: "#EDE6DC",
          text: "#6E5254",
          border: "#E0D4C8",
          success: "#8FAF9A",
          warning: "#C9A962",
          stars: "#C9A962",
          ink: "#2A1215",
          ivory: "#FFFCF8"
        }
      },
      spacing: {
        "lux-1": "0.375rem",
        "lux-2": "0.625rem",
        "lux-3": "1rem",
        "lux-4": "1.5rem",
        "lux-5": "2.25rem",
        "lux-6": "3.25rem",
        "lux-7": "4.5rem"
      },
      boxShadow: {
        satin: "0 20px 64px rgba(69, 0, 6, 0.12)",
        glow: "0 0 42px rgba(201, 169, 98, 0.28)",
        "glow-burgundy": "0 0 36px rgba(69, 0, 6, 0.18)",
        soft: "0 14px 38px rgba(42, 18, 21, 0.08)",
        "brand-gold": "0 0 48px rgba(201, 169, 98, 0.35)"
      },
      backgroundImage: {
        satin:
          "radial-gradient(circle at 18% 18%, rgba(255,255,255,.96), transparent 28%), radial-gradient(circle at 80% 0%, rgba(217,196,160,.22), transparent 34%), linear-gradient(135deg, #F3E1E4 0%, #EDE6DC 48%, #FFFCF8 100%)",
        "rose-lux": "linear-gradient(135deg, rgba(69,0,6,.94) 0%, rgba(45,0,4,.98) 100%)",
        "gulf-lux":
          "radial-gradient(circle at 50% 42%, rgba(201,169,98,.16), transparent 52%), linear-gradient(180deg, #F3E1E4 0%, #EDE6DC 100%)"
      },
      fontFamily: {
        sans: ["var(--font-thmanyah-text)", "Arial", "sans-serif"],
        display: ["var(--font-thmanyah-display)", "Georgia", "serif"],
        "thmanyah-display": ["var(--font-thmanyah-display)", "Georgia", "serif"],
        "thmanyah-text": ["var(--font-thmanyah-text)", "Arial", "sans-serif"],
        brand: ["var(--font-thmanyah-display)", "Georgia", "serif"]
      },
      fontSize: {
        "wahaj-hero": ["clamp(2.65rem, 7.2vw, 4.75rem)", { lineHeight: "1.08", fontWeight: "500" }],
        "wahaj-section": ["clamp(1.95rem, 5.2vw, 3.15rem)", { lineHeight: "1.18", fontWeight: "500" }],
        "wahaj-product": ["1.1rem", { lineHeight: "1.55", fontWeight: "500" }],
        "wahaj-price": ["1.1rem", { lineHeight: "1.4", fontWeight: "500" }],
        "wahaj-description": ["1rem", { lineHeight: "1.85", fontWeight: "400" }],
        "wahaj-nav": ["0.95rem", { lineHeight: "1.7", fontWeight: "500" }]
      },
      letterSpacing: {
        brand: "0.14em",
        "brand-tight": "0.06em"
      }
    }
  },
  plugins: []
};

export default config;
