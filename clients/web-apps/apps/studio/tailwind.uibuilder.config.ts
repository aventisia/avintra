import type { Config } from "tailwindcss";

import {
  UI_BUILDER_FRAMEWORK_TOKEN_VALUES,
  UI_BUILDER_FRAMEWORK_UTILITIES,
} from "./src/features/ui-builder/constants/ui-builder-framework-tokens.constant";

const config: Config = {
  content: [],
  safelist: [...UI_BUILDER_FRAMEWORK_UTILITIES],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: UI_BUILDER_FRAMEWORK_TOKEN_VALUES["--ui-radius"],
      },
      colors: {
        background: "var(--ui-background)",
        foreground: "var(--ui-foreground)",
        primary: {
          DEFAULT: "var(--ui-primary)",
          foreground: "var(--ui-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--ui-secondary)",
          foreground: "var(--ui-secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--ui-muted)",
          foreground: "var(--ui-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--ui-accent)",
          foreground: "var(--ui-accent-foreground)",
        },
        border: "var(--ui-border)",
        destructive: {
          DEFAULT: "var(--ui-destructive)",
          foreground: "var(--ui-destructive-foreground)",
        },
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({ ":root": { ...UI_BUILDER_FRAMEWORK_TOKEN_VALUES } });
    },
  ],
};

export default config;
