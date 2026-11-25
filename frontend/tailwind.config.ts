import type { Config } from "tailwindcss";

const withOpacity = (token: string) =>
  `rgb(var(--${token}-rgb) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: withOpacity("color-bg"),
        surface: withOpacity("color-surface"),
        "surface-hover": withOpacity("color-surface-hover"),
        border: withOpacity("color-border"),
        text: {
          primary: withOpacity("color-text-primary"),
          secondary: withOpacity("color-text-secondary"),
          muted: withOpacity("color-text-muted"),
        },
        primary: {
          DEFAULT: withOpacity("color-primary"),
          hover: withOpacity("color-primary-hover"),
          contrast: withOpacity("color-primary-contrast"),
        },
        income: withOpacity("color-income"),
        expense: withOpacity("color-expense"),
        saving: withOpacity("color-saving"),
        risk: {
          low: withOpacity("risk-low"),
          medium: withOpacity("risk-medium"),
          high: withOpacity("risk-high"),
          critical: withOpacity("risk-critical"),
        },
        budget: {
          ok: withOpacity("color-budget-ok"),
          warn: withOpacity("color-budget-warn"),
          over: withOpacity("color-budget-over"),
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderWidth: {
        3: "3px",
      },
      keyframes: {
        "slide-up": {
          from: { opacity: "0", transform: "translateY(0.5rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-up": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.2s ease-out",
        "fade-in": "fade-in 0.15s ease-out",
        "scale-up": "scale-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
