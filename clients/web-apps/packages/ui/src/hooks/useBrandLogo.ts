import { useBranding } from "./useBranding";

/** The logo variants a deployment can brand. */
export type BrandLogoVariant = "company" | "product" | "short";

/**
 * Returns the effective deployment logo URL for the given variant, preferring the light asset
 * and falling back to the dark one.
 */
const useBrandLogo = (variant: BrandLogoVariant): string | undefined => {
  const branding = useBranding();

  if (variant === "company") {
    return branding.companyLogoUrlLight ?? branding.companyLogoUrlDark;
  }

  if (variant === "product") {
    return branding.productLogoUrlLight ?? branding.productLogoUrlDark;
  }

  return branding.shortLogoUrlLight ?? branding.shortLogoUrlDark;
};

export { useBrandLogo };
