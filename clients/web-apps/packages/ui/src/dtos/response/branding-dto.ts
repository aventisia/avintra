/**
 * Deployment branding configuration served by `GET /branding`. Values are null when unset.
 * Asset URLs are absolute HTTPS URLs on the deployment's domain.
 */
interface BrandingDto {
  /** Custom application/product name. */
  appName: string | null;

  /** Custom company name. */
  companyName: string | null;

  /** Light company logo (full wordmark) URL. */
  companyLogoUrlLight: string | null;

  /** Dark company logo URL. Reserved for a future dark theme; used as the light variant's fallback. */
  companyLogoUrlDark: string | null;

  /** Light product logo URL. */
  productLogoUrlLight: string | null;

  /** Dark product logo URL; used as the light variant's fallback. */
  productLogoUrlDark: string | null;

  /** Light short logo URL. */
  shortLogoUrlLight: string | null;

  /** Dark short logo URL; used as the light variant's fallback. */
  shortLogoUrlDark: string | null;

  /** Light favicon URL. */
  faviconUrlLight: string | null;

  /** Dark favicon URL; used as the light variant's fallback. */
  faviconUrlDark: string | null;

  /** Background brand color as a CSS color value. */
  backgroundColor: string | null;

  /** Foreground brand color as a CSS color value. */
  foregroundColor: string | null;

  /** Primary brand color as a CSS color value. */
  primaryColor: string | null;

  /** Primary foreground brand color as a CSS color value. */
  primaryForegroundColor: string | null;

  /** Secondary brand color as a CSS color value. */
  secondaryColor: string | null;

  /** Secondary foreground brand color as a CSS color value. */
  secondaryForegroundColor: string | null;

  /** Accent brand color as a CSS color value. */
  accentColor: string | null;

  /** Accent foreground brand color as a CSS color value. */
  accentForegroundColor: string | null;
}

export { type BrandingDto };
