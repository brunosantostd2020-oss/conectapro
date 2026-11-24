import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: { extend: { colors: {
    paper: "var(--paper)", card: "var(--card)", ink: "var(--ink)", mute: "var(--mute)",
    line: "var(--line)", brand: "var(--brand)", sun: "var(--sun)" },
    fontFamily: { sans: ["var(--font)", "system-ui", "sans-serif"] } } },
} satisfies Config;
