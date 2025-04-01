import type { Config } from "tailwindcss";
import colors from 'tailwindcss/colors';
import { parseColor } from 'tailwindcss/lib/util/color';
import plugin from 'tailwindcss/plugin';

const toRGB = (value) => {
  return parseColor(value).color.join(" ");
};

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "./components/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "./app/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "./src/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "./react-toolkit/**/*.{html,js,jsx,ts,tsx,md,mdx}",
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
        theme: {
          1: "rgb(var(--color-theme-1) / <alpha-value>)",
          2: "rgb(var(--color-theme-2) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          50: 'hsl(224.3, 76.3%, 95%)',
          100: 'hsl(224.3, 76.3%, 90%)',
          200: 'hsl(224.3, 76.3%, 80%)',
          300: 'hsl(224.3, 76.3%, 70%)',
          400: 'hsl(224.3, 76.3%, 60%)',
          500: 'hsl(224.3, 76.3%, 48%)', // Base color
          600: 'hsl(224.3, 76.3%, 40%)',
          700: 'hsl(224.3, 76.3%, 30%)',
          800: 'hsl(224.3, 76.3%, 20%)',
          900: 'hsl(224.3, 76.3%, 10%)',
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
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
      backgroundImage: {
        "texture-black":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2346.899' height='1200.894' viewBox='0 0 2346.899 1200.894'%3E%3Cg id='Group_369' data-name='Group 369' transform='translate(-33.74 508.575)'%3E%3Cg id='Group_366' data-name='Group 366' transform='translate(33.74 -458.541)'%3E%3Crect id='Rectangle_492' data-name='Rectangle 492' width='745.289' height='650.113' transform='matrix(0.978, 0.208, -0.208, 0.978, 296.729, 261.648)' fill='rgba(30,41,59,0.01)'/%3E%3Crect id='Rectangle_491' data-name='Rectangle 491' width='1335.276' height='650.113' transform='translate(0 543.106) rotate(-24)' fill='rgba(30,41,59,0.01)'/%3E%3C/g%3E%3Cg id='Group_367' data-name='Group 367' transform='translate(1647.456 1026.688) rotate(-128)'%3E%3Crect id='Rectangle_492-2' data-name='Rectangle 492' width='745.289' height='650.113' transform='matrix(0.978, 0.208, -0.208, 0.978, 296.729, 261.648)' fill='rgba(30,41,59,0.01)'/%3E%3Crect id='Rectangle_491-2' data-name='Rectangle 491' width='1335.276' height='650.113' transform='translate(0 543.106) rotate(-24)' fill='rgba(30,41,59,0.01)'/%3E%3C/g%3E%3Cg id='Group_368' data-name='Group 368' transform='matrix(-0.656, -0.755, 0.755, -0.656, 1017.824, 1042.94)'%3E%3Crect id='Rectangle_492-3' data-name='Rectangle 492' width='745.289' height='650.113' transform='matrix(0.978, 0.208, -0.208, 0.978, 296.729, 261.648)' fill='rgba(30,41,59,0.01)'/%3E%3Crect id='Rectangle_491-3' data-name='Rectangle 491' width='1335.276' height='650.113' transform='translate(0 543.106) rotate(-24)' fill='rgba(30,41,59,0.01)'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A\")",
        "texture-white":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2346.899' height='1200.894' viewBox='0 0 2346.899 1200.894'%3E%3Cg id='Group_369' data-name='Group 369' transform='translate(-33.74 508.575)'%3E%3Cg id='Group_366' data-name='Group 366' transform='translate(33.74 -458.541)'%3E%3Crect id='Rectangle_492' data-name='Rectangle 492' width='745.289' height='650.113' transform='translate(296.729 261.648) rotate(12.007)' fill='rgba(255,255,255,0.014)'/%3E%3Crect id='Rectangle_491' data-name='Rectangle 491' width='1335.276' height='650.113' transform='translate(0 543.106) rotate(-24)' fill='rgba(255,255,255,0.014)'/%3E%3C/g%3E%3Cg id='Group_367' data-name='Group 367' transform='translate(1647.456 1026.688) rotate(-128)'%3E%3Crect id='Rectangle_492-2' data-name='Rectangle 492' width='745.289' height='650.113' transform='translate(296.729 261.648) rotate(12.007)' fill='rgba(255,255,255,0.014)'/%3E%3Crect id='Rectangle_491-2' data-name='Rectangle 491' width='1335.276' height='650.113' transform='translate(0 543.106) rotate(-24)' fill='rgba(255,255,255,0.014)'/%3E%3C/g%3E%3Cg id='Group_368' data-name='Group 368' transform='matrix(-0.656, -0.755, 0.755, -0.656, 1017.824, 1042.94)'%3E%3Crect id='Rectangle_492-3' data-name='Rectangle 492' width='745.289' height='650.113' transform='translate(296.729 261.648) rotate(12.007)' fill='rgba(255,255,255,0.014)'/%3E%3Crect id='Rectangle_491-3' data-name='Rectangle 491' width='1335.276' height='650.113' transform='translate(0 543.106) rotate(-24)' fill='rgba(255,255,255,0.014)'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A\")",
        "chevron-white":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff95' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        "chevron-black":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2300000095' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ addBase }) {
      addBase({
        // Default colors
        ":root": {
          "--color-theme-1": toRGB("#03045e"),
          "--color-theme-2": toRGB("#0c4a6e"),
          "--color-primary": toRGB("#03045e"),
          "--color-secondary": toRGB(colors.slate["200"]),
          "--color-success": toRGB(colors.teal["600"]),
          "--color-info": toRGB(colors.cyan["600"]),
          "--color-warning": toRGB(colors.yellow["600"]),
          "--color-pending": toRGB(colors.orange["700"]),
          "--color-danger": toRGB(colors.red["700"]),
          "--color-light": toRGB(colors.slate["100"]),
          "--color-dark": toRGB(colors.slate["800"]),
          "&.dark": {
            "--color-theme-1": toRGB("#0c4a6e"),
            "--color-theme-2": toRGB("#080976"),
            "--color-primary": toRGB("#0c4a6e"),
          },
        },
        // Default dark-mode colors
        ".dark": {
          "--color-primary": toRGB(colors.blue["700"]),
          "--color-darkmode-50": "45 45 45",
          "--color-darkmode-100": "40 40 40",
          "--color-darkmode-200": "35 35 35",
          "--color-darkmode-300": "30 30 30",
          "--color-darkmode-400": "25 25 25",
          "--color-darkmode-500": "20 20 20",
          "--color-darkmode-600": "15 15 15",
          "--color-darkmode-700": "10 10 10",
          "--color-darkmode-800": "5 5 5",
          "--color-darkmode-900": "0 0 0",
        },
      });
    }),
  ],
} satisfies Config;

export default config;
