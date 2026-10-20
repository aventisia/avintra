import { type UiBuilderThemeDto } from "../dtos/ui-builder-dto";

/** Theme used when a project has none configured. */
export const UI_BUILDER_DEFAULT_THEME: UiBuilderThemeDto = {
  primaryColor: "#4f46e5",
  neutralColor: "slate",
  radius: "md",
  fontFamily: "inter",
  mode: "light",
};

/** Preset brand colors offered by the theme editor. */
export const UI_BUILDER_THEME_PRESETS = [
  { label: "Indigo", value: "#4f46e5" },
  { label: "Blue", value: "#2563eb" },
  { label: "Sky", value: "#0284c7" },
  { label: "Teal", value: "#0d9488" },
  { label: "Emerald", value: "#059669" },
  { label: "Amber", value: "#d97706" },
  { label: "Rose", value: "#e11d48" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Slate", value: "#334155" },
] as const;

const RADIUS_SCALES: Record<UiBuilderThemeDto["radius"], [string, string, string, string]> = {
  none: ["0px", "0px", "0px", "0px"],
  sm: ["0.125rem", "0.25rem", "0.375rem", "0.5rem"],
  md: ["0.25rem", "0.375rem", "0.5rem", "0.75rem"],
  lg: ["0.375rem", "0.5rem", "0.75rem", "1rem"],
  xl: ["0.5rem", "0.75rem", "1rem", "1.25rem"],
};

const FONT_STACKS: Record<UiBuilderThemeDto["fontFamily"], string> = {
  inter: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
  system: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
};

const KEYFRAMES = `
@keyframes avk-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes avk-zoom-in { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
@keyframes avk-pop-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes avk-slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes avk-slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes avk-slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

const relativeLuminance = (hex: string) => {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const readPaletteColor = (tailwindCss: string, name: string) =>
  new RegExp(`--color-${name}:\\s*([^;]+);`).exec(tailwindCss)?.[1]?.trim() ?? "currentColor";

/**
 * Builds the Tailwind v4 input stylesheet for a built document: the framework import, the
 * project's semantic color, radius, and font tokens for its light or dark mode, base element
 * styles, and the kit's animation keyframes.
 */
export const buildUiBuilderThemeCss = (theme: UiBuilderThemeDto, tailwindCss: string) => {
  const neutral = (shade: number) =>
    readPaletteColor(tailwindCss, `${theme.neutralColor}-${shade}`);
  const palette = (name: string) => readPaletteColor(tailwindCss, name);
  const isDark = theme.mode === "dark";
  const primary = theme.primaryColor;
  const primaryForeground = relativeLuminance(primary) > 0.45 ? neutral(950) : "#ffffff";
  const [radiusSm, radiusMd, radiusLg, radiusXl] = RADIUS_SCALES[theme.radius];
  const tone = (light: string, dark: string) => palette(isDark ? dark : light);

  const tokens: Record<string, string> = {
    "--color-background": isDark ? neutral(950) : "#ffffff",
    "--color-foreground": isDark ? neutral(50) : neutral(950),
    "--color-card": isDark ? neutral(900) : "#ffffff",
    "--color-card-foreground": isDark ? neutral(50) : neutral(950),
    "--color-popover": isDark ? neutral(900) : "#ffffff",
    "--color-popover-foreground": isDark ? neutral(50) : neutral(950),
    "--color-primary": primary,
    "--color-primary-foreground": primaryForeground,
    "--color-secondary": isDark ? neutral(800) : neutral(100),
    "--color-secondary-foreground": isDark ? neutral(50) : neutral(900),
    "--color-muted": isDark ? neutral(800) : neutral(100),
    "--color-muted-foreground": isDark ? neutral(400) : neutral(500),
    "--color-accent": `color-mix(in oklab, ${primary} ${isDark ? 20 : 10}%, ${isDark ? neutral(900) : "#ffffff"})`,
    "--color-accent-foreground": isDark ? neutral(50) : neutral(900),
    "--color-border": isDark ? neutral(800) : neutral(200),
    "--color-input": isDark ? neutral(700) : neutral(300),
    "--color-ring": primary,
    "--color-destructive": tone("red-600", "red-500"),
    "--color-destructive-foreground": "#ffffff",
    "--color-success": tone("emerald-600", "emerald-400"),
    "--color-warning": tone("amber-600", "amber-400"),
    "--color-info": tone("sky-600", "sky-400"),
    "--color-chart-1": primary,
    "--color-chart-2": tone("sky-500", "sky-400"),
    "--color-chart-3": tone("amber-500", "amber-400"),
    "--color-chart-4": tone("emerald-500", "emerald-400"),
    "--color-chart-5": tone("rose-500", "rose-400"),
    "--color-chart-6": tone("violet-500", "violet-400"),
    "--radius-sm": radiusSm,
    "--radius-md": radiusMd,
    "--radius-lg": radiusLg,
    "--radius-xl": radiusXl,
    "--font-sans": FONT_STACKS[theme.fontFamily],
  };

  return [
    '@import "tailwindcss";',
    `@theme {\n${Object.entries(tokens)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join("\n")}\n}`,
    "@layer base {",
    `  :root { color-scheme: ${isDark ? "dark" : "light"}; }`,
    "  *, ::after, ::before { border-color: var(--color-border); }",
    "  body { background-color: var(--color-background); color: var(--color-foreground); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; font-feature-settings: 'cv11', 'ss01'; }",
    "  :focus-visible { outline-color: var(--color-ring); }",
    "}",
    KEYFRAMES,
  ].join("\n");
};

/** Summarizes a theme for the system prompt so generated code matches it. */
export const describeUiBuilderTheme = (theme: UiBuilderThemeDto) =>
  `${theme.mode} mode, primary ${theme.primaryColor}, ${theme.neutralColor} neutrals, ${theme.radius} corner radius, ${theme.fontFamily} font`;
