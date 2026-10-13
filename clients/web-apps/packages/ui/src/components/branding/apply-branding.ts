import type { ResolvedBranding } from "@/ui/stores";
import { pickReadableForeground } from "@/ui/utils";

// Numeric shade ramp mixes (percent of the brand color toward white/black).
const COLOR_RAMP_MIX: Array<{ shade: string; percent: number; base: "white" | "black" }> = [
  { shade: "50", percent: 5, base: "white" },
  { shade: "100", percent: 12, base: "white" },
  { shade: "200", percent: 25, base: "white" },
  { shade: "300", percent: 40, base: "white" },
  { shade: "400", percent: 60, base: "white" },
  { shade: "600", percent: 88, base: "black" },
  { shade: "700", percent: 76, base: "black" },
  { shade: "800", percent: 64, base: "black" },
  { shade: "900", percent: 52, base: "black" },
];

/**
 * Derives the `--<token>-50..900` numeric shade ramp from a single brand color so
 * components that use shades (e.g. `hover:border-primary-200`) follow the brand.
 */
const applyColorRamp = (root: HTMLElement, token: string, color: string) => {
  root.style.setProperty(`--${token}-500`, color);
  COLOR_RAMP_MIX.forEach(({ shade, percent, base }) => {
    root.style.setProperty(
      `--${token}-${shade}`,
      `color-mix(in srgb, ${color} ${percent}%, ${base})`,
    );
  });
};

/** Applies the brand color, its shade ramp, the accent/ring tints and readable foregrounds. */
const applyBrandColors = (root: HTMLElement, branding: ResolvedBranding) => {
  const { primaryColor, secondaryColor } = branding;

  if (primaryColor) {
    root.style.setProperty("--primary", primaryColor);
    root.style.setProperty("--primary-foreground", pickReadableForeground(primaryColor));
    root.style.setProperty("--accent", `color-mix(in srgb, ${primaryColor} 8%, white)`);
    root.style.setProperty("--ring", `color-mix(in srgb, ${primaryColor} 20%, transparent)`);
    applyColorRamp(root, "primary", primaryColor);
  }

  // Secondary brand surface (secondary buttons, banner, tooltip, sidebar marker) + shade ramp.
  if (secondaryColor) {
    root.style.setProperty("--secondary", secondaryColor);
    root.style.setProperty("--secondary-foreground", pickReadableForeground(secondaryColor));
    applyColorRamp(root, "secondary", secondaryColor);
  }
};

/** Points every favicon link at the branded icon. */
const applyBrandFavicon = (branding: ResolvedBranding) => {
  const { faviconUrl } = branding;
  if (!faviconUrl) {
    return;
  }

  // Match `rel="icon"` and multi-token variants such as `rel="shortcut icon"`.
  document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]').forEach((favicon) => {
    favicon.href = faviconUrl;
  });
};

/** Sets the base document title from the brand names. Overridden per page by `useDocumentTitle`. */
const applyBrandTitle = (branding: ResolvedBranding) => {
  const { appName, companyName } = branding;
  if (!appName && !companyName) {
    return;
  }

  if (appName && companyName) {
    document.title = `${appName} | ${companyName}`;
    return;
  }

  document.title = appName || companyName || document.title;
};

/**
 * Applies branding to the document: brand CSS custom properties (color + shade ramp, accent,
 * ring, readable foregrounds), the favicon, and a base document title.
 *
 * @param {ResolvedBranding} branding - The resolved deployment branding.
 *
 * @remarks
 * - `--accent` (hover surface) and `--ring` are tints of the primary color.
 * - A page-level `useDocumentTitle` overrides the base title set here.
 */
const applyBrandingToDocument = (branding: ResolvedBranding): void => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  applyBrandColors(root, branding);
  applyBrandFavicon(branding);
  applyBrandTitle(branding);
};

export { applyBrandingToDocument };
