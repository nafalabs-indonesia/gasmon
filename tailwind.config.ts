import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                monad: {
                    DEFAULT: "#04ff2c",
                    dim: "rgba(4,255,44,0.12)",
                    glow: "rgba(4,255,44,0.25)",
                },
                surface: {
                    base: "#0a0a0a",
                    card: "rgba(255,255,255,0.04)",
                    hover: "rgba(255,255,255,0.07)",
                    border: "rgba(255,255,255,0.08)",
                    strong: "rgba(255,255,255,0.12)",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                "fade-in": "fadeIn 0.2s ease-out",
                "slide-up": "slideUp 0.25s ease-out",
                "pulse-glow": "pulseGlow 2s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 0 0 rgba(4,255,44,0)" },
                    "50%": { boxShadow: "0 0 20px 4px rgba(4,255,44,0.15)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;