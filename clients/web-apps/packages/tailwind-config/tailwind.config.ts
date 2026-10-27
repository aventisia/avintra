import tailwindcssTypography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// IMPORTANT NOTE: Tailwind cannot add an alpha channel to a plain `var(--x)` color, so `/opacity`
// modifiers are dropped. Mixing with transparent restores them, and a 100% mix equals the source color.
const withAlpha = (value: string) =>
  `color-mix(in srgb, ${value} calc(<alpha-value> * 100%), transparent)`;

const config = {
  darkMode: ["class"],
  content: ["./src/**/*.{html,js,jsx,ts,tsx,md,mdx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        sm: "640px", // small => @media (min-width: 640px) { ... }
        md: "768px", // medium => @media (min-width: 768px) { ... }
        lg: "1024px", // large => @media (min-width: 1024px) { ... }
        xl: "1280px", // extra-large => @media (min-width: 1280px) { ... }
        "2xl": "1440px", // 2-extra-large => @media (min-width: 1440px) { ... }
      },
    },
    fontSize: {
      sm: ["0.8rem", "1.25rem"],
      md: ["0.875rem", "1.375rem"],
      base: ["0.95rem", "1.5rem"],
      lg: ["1.1rem", "1.6rem"],
      xl: ["1.2rem", "1.75rem"],
      "2xl": ["1.45rem", "2rem"],
      "3xl": ["1.825rem", "2.25rem"],
      "4xl": ["2.2rem", "2.5rem"],
      "5xl": ["2.95rem", "1"],
    },
    extend: {
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "3xs": ["0.6rem", "1rem"],
        "2xs": ["0.7rem", "1rem"],
        xs: ["0.75rem", "1.1rem"],
        display: ["40px", { lineHeight: "44px", letterSpacing: "-0.035em", fontWeight: "600" }],
        title: ["28px", { lineHeight: "31px", letterSpacing: "-0.035em", fontWeight: "600" }],
        heading: ["16px", { lineHeight: "20px", letterSpacing: "-0.01em", fontWeight: "600" }],
        body: ["14px", "20px"],
        "body-sm": ["13.5px", "20px"],
        button: ["13.5px", { lineHeight: "20px", fontWeight: "600" }],
        hint: ["12.5px", "18px"],
        label: ["10.5px", { lineHeight: "14px", letterSpacing: "0.07em", fontWeight: "500" }],
        code: ["12.5px", "18px"],
      },
      spacing: {
        "control-xs": "24px",
        "control-sm": "28px",
        "control-md": "32px",
        "control-lg": "38px",
        row: "40px",
      },
      boxShadow: {
        pop: "var(--shadow-pop)",
        focus: "var(--shadow-focus)",
        select: "var(--shadow-select)",
      },
      screens: {
        mxs: "280px", // mobile-extra-small => @media (min-width: 280px) { ... }
        msm: "320px", // mobile-small => @media (min-width: 320px) { ... }
        mmd: "375px", // mobile-medium => @media (min-width: 375px) { ... }
        mlg: "425px", // mobile-large => @media (min-width: 425px) { ... }
        xs: "500px", // extra-small => @media (min-width: 500px) { ... }
        "2md": "868px", // 2-medium => @media (min-width: 868px) { ... }
        "3md": "968px", // 3-medium => @media (min-width: 968px) { ... }
        "2lg": "1124px", // 2-large => @media (min-width: 1124px) { ... }
        "3lg": "1224px", // 3-large => @media (min-width: 1224px) { ... }
      },
      colors: {
        border: withAlpha("var(--border)"),
        input: withAlpha("var(--input)"),
        ring: withAlpha("var(--ring)"),
        background: withAlpha("var(--background)"),
        foreground: withAlpha("var(--foreground)"),
        primary: {
          DEFAULT: withAlpha("var(--primary)"),
          foreground: withAlpha("var(--primary-foreground)"),
          50: withAlpha("var(--primary-50)"),
          100: withAlpha("var(--primary-100)"),
          200: withAlpha("var(--primary-200)"),
          300: withAlpha("var(--primary-300)"),
          400: withAlpha("var(--primary-400)"),
          500: withAlpha("var(--primary-500)"),
          600: withAlpha("var(--primary-600)"),
          700: withAlpha("var(--primary-700)"),
          800: withAlpha("var(--primary-800)"),
          900: withAlpha("var(--primary-900)"),
        },
        secondary: {
          DEFAULT: withAlpha("var(--secondary)"),
          foreground: withAlpha("var(--secondary-foreground)"),
          50: withAlpha("var(--secondary-50)"),
          100: withAlpha("var(--secondary-100)"),
          200: withAlpha("var(--secondary-200)"),
          300: withAlpha("var(--secondary-300)"),
          400: withAlpha("var(--secondary-400)"),
          500: withAlpha("var(--secondary-500)"),
          600: withAlpha("var(--secondary-600)"),
          700: withAlpha("var(--secondary-700)"),
          800: withAlpha("var(--secondary-800)"),
          900: withAlpha("var(--secondary-900)"),
        },
        destructive: {
          DEFAULT: withAlpha("var(--destructive)"),
          foreground: withAlpha("var(--destructive-foreground)"),
        },
        muted: {
          DEFAULT: withAlpha("var(--muted)"),
          foreground: withAlpha("var(--muted-foreground)"),
        },
        accent: {
          DEFAULT: withAlpha("var(--accent)"),
          foreground: withAlpha("var(--accent-foreground)"),
        },
        popover: {
          DEFAULT: withAlpha("var(--popover)"),
          foreground: withAlpha("var(--popover-foreground)"),
        },
        card: {
          DEFAULT: withAlpha("var(--card)"),
          foreground: withAlpha("var(--card-foreground)"),
        },
        bg: withAlpha("var(--bg)"),
        surface: withAlpha("var(--surface)"),
        sunken: withAlpha("var(--sunken)"),
        hover: withAlpha("var(--hover)"),
        fill: withAlpha("var(--fill)"),
        selected: withAlpha("var(--selected)"),
        line: {
          DEFAULT: withAlpha("var(--line)"),
          strong: withAlpha("var(--line-strong)"),
        },
        ink: {
          DEFAULT: withAlpha("var(--ink)"),
          2: withAlpha("var(--ink-2)"),
        },
        "primary-hover": withAlpha("var(--primary-hover)"),
        "primary-text": withAlpha("var(--primary-text)"),
        "secondary-hover": withAlpha("var(--secondary-hover)"),
        indicator: withAlpha("var(--indicator)"),
        focus: withAlpha("var(--focus)"),
        live: withAlpha("var(--live)"),
        ok: withAlpha("var(--ok)"),
        warn: withAlpha("var(--warn)"),
        bad: {
          DEFAULT: withAlpha("var(--bad)"),
          hover: withAlpha("var(--bad-hover)"),
          foreground: withAlpha("var(--on-bad)"),
        },
        scrim: "var(--scrim)",
        "canvas-grid": withAlpha("var(--canvas-grid)"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite", // Required for OTP field
      },
    },
  },
  plugins: [tailwindcssAnimate, tailwindcssTypography],
} satisfies Config;

export default config;
