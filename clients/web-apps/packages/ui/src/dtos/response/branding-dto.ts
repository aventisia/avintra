/**
 * Deployment branding configuration served by `GET /branding`. Values are null when unset.
 * Asset URLs are absolute HTTPS URLs on the deployment's domain.
 */
interface BrandingDto {
  /** Custom application/product name. */
  appName: string | null;

  /** Custom company name. */
  companyName: string | null;

  /** Compact logo URL. */
  logoUrl: string | null;

  /** Dark-theme logo URL. Reserved for a future dark theme; used as the logo fallback. */
  logoUrlDark: string | null;

  /** Full wordmark logo URL, shown where the full logo with the app name is used. */
  fullLogoUrl: string | null;

  /** Favicon URL. */
  faviconUrl: string | null;

  /** Primary brand color as a CSS color value. */
  primaryColor: string | null;

  /** Secondary brand color as a CSS color value. */
  secondaryColor: string | null;
}

export { type BrandingDto };
