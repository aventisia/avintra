import type { Config } from "tailwindcss";

import {
  UI_BUILDER_FRAMEWORK_TOKEN_VALUES,
  UI_BUILDER_FRAMEWORK_UTILITIES,
} from "./src/features/ui-builder/constants/ui-builder-framework-tokens.constant";

const toRgbChannels = (value: string) => {
  const rgbMatch = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(value);
  if (rgbMatch) return `${rgbMatch[1]} ${rgbMatch[2]} ${rgbMatch[3]}`;
  const hex = value.replace("#", "");
  const full = hex.length === 3 ? [...hex].map((digit) => digit + digit).join("") : hex;
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16)).join(" ");
};

const COLOR_TOKEN_NAMES = Object.keys(UI_BUILDER_FRAMEWORK_TOKEN_VALUES).filter(
  (name) => !name.endsWith("-radius") && !name.startsWith("--ui-font"),
) as (keyof typeof UI_BUILDER_FRAMEWORK_TOKEN_VALUES)[];

const channelVariables = Object.fromEntries(
  COLOR_TOKEN_NAMES.map((name) => [
    `${name}-rgb`,
    toRgbChannels(UI_BUILDER_FRAMEWORK_TOKEN_VALUES[name]),
  ]),
);

const tokenColor = (name: string) => `rgb(var(--ui-${name}-rgb) / <alpha-value>)`;

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
        background: tokenColor("background"),
        foreground: tokenColor("foreground"),
        primary: {
          DEFAULT: tokenColor("primary"),
          foreground: tokenColor("primary-foreground"),
        },
        secondary: {
          DEFAULT: tokenColor("secondary"),
          foreground: tokenColor("secondary-foreground"),
        },
        muted: {
          DEFAULT: tokenColor("muted"),
          foreground: tokenColor("muted-foreground"),
        },
        accent: {
          DEFAULT: tokenColor("accent"),
          foreground: tokenColor("accent-foreground"),
        },
        border: tokenColor("border"),
        destructive: {
          DEFAULT: tokenColor("destructive"),
          foreground: tokenColor("destructive-foreground"),
        },
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({ ":root": { ...UI_BUILDER_FRAMEWORK_TOKEN_VALUES, ...channelVariables } });
    },
  ],
};

export default config;
