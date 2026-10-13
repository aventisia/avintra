import tailwindcssTypography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
        // Primary font
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        "3xs": ["0.6rem", "1rem"],
        "2xs": ["0.7rem", "1rem"],
        xs: ["0.75rem", "1.1rem"],
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
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          // Numeric shades derive from the brand `--primary` at runtime (see applyBrandingToDocument
          // in @avplatform/ui branding); the fallbacks match the built-in indigo ramp for unbranded deployments.
          50: "var(--primary-50, hsl(240, 83%, 95%))",
          100: "var(--primary-100, hsl(243, 77%, 88%))",
          200: "var(--primary-200, hsl(240, 78%, 81%))",
          300: "var(--primary-300, hsl(239, 79%, 73%))",
          400: "var(--primary-400, hsl(241, 78%, 66%))",
          500: "var(--primary-500, hsl(243, 75%, 59%))", // Primary color
          600: "var(--primary-600, hsl(245, 67%, 55%))",
          700: "var(--primary-700, hsl(246, 61%, 50%))",
          800: "var(--primary-800, hsl(248, 69%, 45%))",
          900: "var(--primary-900, hsl(255, 100%, 35%))",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          // Numeric shades derive from the brand `--secondary` at runtime (see applyBrandingToDocument in @avplatform/ui branding).
          50: "var(--secondary-50, hsl(227, 22%, 92%))",
          100: "var(--secondary-100, hsl(232, 24%, 80%))",
          200: "var(--secondary-200, hsl(233, 22%, 67%))",
          300: "var(--secondary-300, hsl(233, 21%, 55%))",
          400: "var(--secondary-400, hsl(235, 24%, 46%))",
          500: "var(--secondary-500, hsl(236, 35%, 38%))",
          600: "var(--secondary-600, hsl(237, 35%, 35%))",
          700: "var(--secondary-700, hsl(238, 38%, 31%))",
          800: "var(--secondary-800, hsl(240, 40%, 27%))",
          900: "var(--secondary-900, hsl(244, 47%, 20%))", // Secondary color
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
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
