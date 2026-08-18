import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        casing: "var(--pd-casing)",
        accent: "rgb(var(--signal) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        raised: "rgb(var(--raised) / <alpha-value>)",
        edge: "rgb(var(--edge) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        signal: "rgb(var(--signal) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        sans: ["'Instrument Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "12px",
      },
      /* Flat offset shadows only. The device gets its depth from moulding and
         offset, never from blur — a blurred shadow reads as paper, not
         plastic. `panel` is the one exception: the detail drawer floats over
         the casing, so it needs a real cast shadow to sit above it. */
      boxShadow: {
        card: "4px 4px 0 rgb(0 0 0 / 0.28)",
        lift: "6px 6px 0 rgb(0 0 0 / 0.3)",
        panel: "0 32px 80px -24px rgb(0 0 0 / 0.6)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "drawer-in": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "sheet-in": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        /* The ball opening. The two halves share one timeline: a shake, the
           split, a beat held open, then the close — the sequence the physical
           throw has, which is what makes it read as a ball and not as two
           shapes moving apart. */
        "ball-shake": {
          "0%, 62%, 100%": { transform: "rotate(0deg)" },
          "8%, 24%": { transform: "rotate(-11deg)" },
          "16%, 32%": { transform: "rotate(11deg)" },
          "40%": { transform: "rotate(0deg)" },
        },
        "ball-open-top": {
          "0%, 42%, 88%, 100%": { transform: "translateY(0)" },
          "56%, 74%": { transform: "translateY(-26%)" },
        },
        "ball-open-bottom": {
          "0%, 42%, 88%, 100%": { transform: "translateY(0)" },
          "56%, 74%": { transform: "translateY(26%)" },
        },
        /* Held while the halves are actually apart (56–74%), not flashed on
           the instant they part — a burst that has already faded by the time
           the ball is open reads as a glitch rather than as a release. */
        "ball-burst": {
          "0%, 46%": { opacity: "0", transform: "scale(0.3)" },
          "56%": { opacity: "1", transform: "scale(1)" },
          "72%": { opacity: "0.55", transform: "scale(1.35)" },
          "84%, 100%": { opacity: "0", transform: "scale(1.6)" },
        },
      },
      animation: {
        "fade-up": "fade-up 380ms cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.6s infinite",
        "drawer-in": "drawer-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "sheet-in": "sheet-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "ball-shake": "ball-shake 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "ball-open-top": "ball-open-top 2.2s cubic-bezier(0.34, 1.3, 0.5, 1) infinite",
        "ball-open-bottom": "ball-open-bottom 2.2s cubic-bezier(0.34, 1.3, 0.5, 1) infinite",
        "ball-burst": "ball-burst 2.2s ease-out infinite",
        "ball-spin": "spin 1.1s linear infinite",
      },
    },
  },
  plugins: [
    animate,
    /* Touch sizing belongs to the pointer, not the viewport: a 768px iPad is
       a finger and a 768px browser window is a mouse, and sizing either by
       width alone gets one of them wrong. */
    plugin(({ addVariant }) => {
      addVariant("coarse", "@media (pointer: coarse)");
      addVariant("fine", "@media (pointer: fine)");
    }),
  ],
} satisfies Config;
