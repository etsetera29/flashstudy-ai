import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode
        "surface-light": "#FFFFFF",
        "bg-light": "#F9FAFB",
        "border-light": "#E5E7EB",
        "text-primary-light": "#111827",
        "text-secondary-light": "#6B7280",
        "accent-light": "#4F46E5",
        "correct-light": "#10B981",
        "wrong-light": "#EF4444",
        // Dark mode
        "surface-dark": "#1A1A2E",
        "bg-dark": "#0F0F1A",
        "border-dark": "#2D2D44",
        "text-primary-dark": "#F3F4F6",
        "text-secondary-dark": "#9CA3AF",
        "accent-dark": "#6366F1",
        "correct-dark": "#34D399",
        "wrong-dark": "#F87171",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
