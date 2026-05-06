import type { Config } from "tailwindcss";
const { heroui } = require("@heroui/react");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
      },
      keyframes: {
        pulse2: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.4)" },
        },
        blink: {
          "0%,50%": { opacity: "1" },
          "51%,100%": { opacity: "0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInRight: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        pulse2: "pulse2 2s infinite",
        blink: "blink 1s infinite",
        float: "float 4s ease-in-out infinite",
        "float-delay": "float 4s 2s ease-in-out infinite",
        fadeInUp: "fadeInUp 0.6s ease both",
        fadeInUp1: "fadeInUp 0.6s 0.1s ease both",
        fadeInUp2: "fadeInUp 0.6s 0.2s ease both",
        fadeInUp3: "fadeInUp 0.6s 0.3s ease both",
        fadeInUp4: "fadeInUp 0.6s 0.4s ease both",
        fadeInUp5: "fadeInUp 0.6s 0.5s ease both",
        fadeInRight: "fadeInRight 0.8s 0.2s ease both",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
