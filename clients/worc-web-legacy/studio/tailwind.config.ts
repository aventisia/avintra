import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "./components/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "./app/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "./src/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "./react-toolkit/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "./node_modules/@aventisia/ui/**/*.js",
  ],
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
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          light: "var(--secondary-light)",
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
  // @tailwindcss/typography required for markdown viewer with "prose" class wrapper on markdown viewer
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
