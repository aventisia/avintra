import { isHttpsBrandAssetUrl } from "@/ui/utils";

import { useBranding } from "./useBranding";

/** The logo variants a deployment can brand. */
export type BrandLogoVariant = "company" | "product" | "short";

/**
 * Returns the effective deployment logo URL for the given variant, preferring the requested
 * light/dark asset and falling back to the other variant when that one is unset.
 */
const useBrandLogo = (variant: BrandLogoVariant, lightLogo = true): string | undefined => {
  const branding = useBranding();

  const pickLogo = (light?: string, dark?: string): string | undefined => {
    const preferred = lightLogo ? light : dark;
    const fallback = lightLogo ? dark : light;

    if (preferred && isHttpsBrandAssetUrl(preferred)) return preferred;
    return fallback && isHttpsBrandAssetUrl(fallback) ? fallback : undefined;
  };

  if (variant === "company") {
    return pickLogo(branding.companyLogoUrlLight, branding.companyLogoUrlDark);
  }

  if (variant === "product") {
    return pickLogo(branding.productLogoUrlLight, branding.productLogoUrlDark);
  }

  return pickLogo(branding.shortLogoUrlLight, branding.shortLogoUrlDark);
};

export { useBrandLogo };
