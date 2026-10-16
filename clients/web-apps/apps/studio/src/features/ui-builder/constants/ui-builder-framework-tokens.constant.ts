/**
 * Design tokens and the curated Tailwind utility safelist for React framework versions.
 *
 * The values here are the single source for the framework Tailwind config, the build
 * validator, and the platform design-system skill prose.
 */

/** CSS custom properties emitted as the built document's token layer. */
export const UI_BUILDER_FRAMEWORK_TOKEN_VALUES = {
  "--ui-background": "#ffffff",
  "--ui-foreground": "#0f172a",
  "--ui-primary": "rgb(79, 70, 229)",
  "--ui-primary-foreground": "#f8fafc",
  "--ui-secondary": "rgb(30, 27, 75)",
  "--ui-secondary-foreground": "#f8fafc",
  "--ui-muted": "#f1f5f9",
  "--ui-muted-foreground": "#64748b",
  "--ui-accent": "rgb(238, 242, 255)",
  "--ui-accent-foreground": "#1e293b",
  "--ui-border": "#e2e8f0",
  "--ui-destructive": "#dc2626",
  "--ui-destructive-foreground": "#f8fafc",
  "--ui-radius": "0.5rem",
  "--ui-font-sans": "Inter, system-ui, sans-serif",
} as const;

/** Compact token summary embedded in the framework system prompt as a fallback. */
export const UI_BUILDER_FRAMEWORK_TOKEN_SUMMARY = [
  `primary ${UI_BUILDER_FRAMEWORK_TOKEN_VALUES["--ui-primary"]}`,
  `secondary ${UI_BUILDER_FRAMEWORK_TOKEN_VALUES["--ui-secondary"]}`,
  `background ${UI_BUILDER_FRAMEWORK_TOKEN_VALUES["--ui-background"]}`,
  `foreground ${UI_BUILDER_FRAMEWORK_TOKEN_VALUES["--ui-foreground"]}`,
  `muted surface ${UI_BUILDER_FRAMEWORK_TOKEN_VALUES["--ui-muted"]}`,
  `borders ${UI_BUILDER_FRAMEWORK_TOKEN_VALUES["--ui-border"]}`,
  `radius ${UI_BUILDER_FRAMEWORK_TOKEN_VALUES["--ui-radius"]}`,
].join(", ");

const SPACING_STEPS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
const SPACING_PREFIXES = [
  "p",
  "px",
  "py",
  "pt",
  "pb",
  "pl",
  "pr",
  "m",
  "mx",
  "my",
  "mt",
  "mb",
  "ml",
  "mr",
  "gap",
  "space-x",
  "space-y",
];

const TEXT_STEPS = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
const COLOR_KEYS = [
  "background",
  "foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "border",
  "destructive",
  "white",
  "black",
];
const NEUTRAL_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const RADIUS_KEYS = ["none", "sm", "", "md", "lg", "xl", "2xl", "full"];
const SHADOW_KEYS = ["none", "sm", "", "md", "lg", "xl"];

const layoutUtilities = [
  "mx-auto",
  "block",
  "inline-block",
  "inline",
  "flex",
  "inline-flex",
  "grid",
  "hidden",
  "relative",
  "absolute",
  "sticky",
  "fixed",
  "overflow-hidden",
  "overflow-auto",
  "overflow-x-auto",
  "overflow-y-auto",
];

const flexUtilities = [
  "flex-1",
  "flex-auto",
  "flex-none",
  "grow",
  "shrink-0",
  "flex-row",
  "flex-col",
  "flex-wrap",
  "flex-nowrap",
  "items-start",
  "items-center",
  "items-end",
  "items-stretch",
  "items-baseline",
  "justify-start",
  "justify-center",
  "justify-between",
  "justify-end",
  "justify-around",
  "self-start",
  "self-center",
  "self-end",
  "self-stretch",
];

const gridUtilities = [
  "grid-cols-1",
  "grid-cols-2",
  "grid-cols-3",
  "grid-cols-4",
  "grid-cols-6",
  "grid-cols-12",
];

const sizingUtilities = [
  "w-full",
  "w-auto",
  "w-fit",
  "w-screen",
  "h-full",
  "h-auto",
  "h-screen",
  "min-h-screen",
  "max-w-xs",
  "max-w-sm",
  "max-w-md",
  "max-w-lg",
  "max-w-xl",
  "max-w-2xl",
  "max-w-3xl",
  "max-w-4xl",
  "max-w-5xl",
  "max-w-6xl",
  "max-w-7xl",
  "max-w-full",
  "aspect-video",
  "aspect-square",
  "object-cover",
  "object-contain",
];

const typographyUtilities = [
  ...TEXT_STEPS.map((step) => `text-${step}`),
  "font-sans",
  "font-normal",
  "font-medium",
  "font-semibold",
  "font-bold",
  "leading-none",
  "leading-tight",
  "leading-normal",
  "leading-relaxed",
  "tracking-tight",
  "tracking-normal",
  "tracking-wide",
  "text-left",
  "text-center",
  "text-right",
  "uppercase",
  "lowercase",
  "capitalize",
  "truncate",
  "italic",
  "underline",
];

const borderUtilities = [
  "border",
  "border-0",
  "border-2",
  "border-b",
  "border-t",
  "border-l",
  "border-r",
  "divide-x",
  "divide-y",
  "divide-border",
  "ring-1",
  "ring-2",
];

const transitionUtilities = [
  "transition",
  "transition-colors",
  "transition-shadow",
  "transition-transform",
  "duration-150",
  "duration-200",
  "duration-300",
  "ease-in-out",
  "cursor-pointer",
  "cursor-not-allowed",
];

const stateUtilities = [
  ...["primary", "secondary", "muted", "accent", "destructive"].map((color) => `hover:bg-${color}`),
  ...["primary", "foreground", "muted-foreground", "white"].map((color) => `hover:text-${color}`),
  "hover:bg-slate-100",
  "hover:bg-white/10",
  "hover:shadow-md",
  "hover:underline",
  "focus:outline-none",
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-primary",
  "focus-visible:ring-offset-2",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
  "active:scale-95",
  "opacity-0",
  "opacity-50",
  "opacity-75",
  "opacity-100",
  "sr-only",
  "not-sr-only",
];

const spacingUtilities = SPACING_STEPS.flatMap((step) =>
  SPACING_PREFIXES.map((prefix) => `${prefix}-${step}`),
);

const colorUtilities = COLOR_KEYS.flatMap((key) => [`text-${key}`, `bg-${key}`, `border-${key}`]);

const neutralUtilities = NEUTRAL_SHADES.flatMap((shade) => [
  `text-slate-${shade}`,
  `bg-slate-${shade}`,
  `border-slate-${shade}`,
  `text-gray-${shade}`,
  `bg-gray-${shade}`,
  `border-gray-${shade}`,
]);

const radiusUtilities = RADIUS_KEYS.map((key) => (key ? `rounded-${key}` : "rounded"));

const shadowUtilities = SHADOW_KEYS.map((key) => (key ? `shadow-${key}` : "shadow"));

const responsiveBase = [
  ...layoutUtilities,
  ...flexUtilities,
  ...gridUtilities,
  "text-left",
  "text-center",
  "text-right",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
  "font-semibold",
  "font-bold",
  "max-w-sm",
  "max-w-md",
  "max-w-lg",
  "max-w-2xl",
  "max-w-4xl",
  "mx-auto",
];

const responsiveUtilities = ["sm", "md", "lg"].flatMap((variant) =>
  responsiveBase.map((utility) => `${variant}:${utility}`),
);

/** Every Tailwind utility a framework version may use. */
export const UI_BUILDER_FRAMEWORK_UTILITIES: readonly string[] = Array.from(
  new Set([
    ...layoutUtilities,
    ...flexUtilities,
    ...gridUtilities,
    ...spacingUtilities,
    ...sizingUtilities,
    ...typographyUtilities,
    ...colorUtilities,
    ...neutralUtilities,
    ...radiusUtilities,
    ...shadowUtilities,
    ...borderUtilities,
    ...transitionUtilities,
    ...stateUtilities,
    ...responsiveUtilities,
  ]),
);
