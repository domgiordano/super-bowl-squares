import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        primary: {
          green: "#00ff88",
          blue: "#0088ff",
        },
        card: {
          DEFAULT: "#111111",
          hover: "#1a1a1a",
        },
        border: {
          DEFAULT: "#222222",
          light: "#333333",
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00ff88 0%, #0088ff 100%)',
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 136, 255, 0.3)',
        'glow-primary': '0 0 30px rgba(0, 255, 136, 0.2), 0 0 60px rgba(0, 136, 255, 0.2)',
        'card-glow': '0 4px 24px rgba(0, 255, 136, 0.1), 0 2px 12px rgba(0, 136, 255, 0.1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
