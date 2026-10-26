import { create } from "zustand";

import type { BrandingDto } from "@/ui/dtos/response/branding-dto";

/** Effective branding after applying build-time Vite fallbacks to the fetched values. */
export type ResolvedBranding = {
  appName?: string;
  companyName?: string;
  companyLogoUrlLight?: string;
  companyLogoUrlDark?: string;
  productLogoUrlLight?: string;
  productLogoUrlDark?: string;
  shortLogoUrlLight?: string;
  shortLogoUrlDark?: string;
  faviconUrlLight?: string;
  faviconUrlDark?: string;
  background?: string;
  foreground?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  accent?: string;
  accentForeground?: string;
};

/**
 * Resolves the effective branding: the API value wins, the build-time Vite defaults fill
 * the name fields, and unset logo/color fields stay undefined.
 *
 * IMPORTANT NOTE: dark logo/favicon variants are resolved as fallbacks because no dark theme
 * exists yet; each asset prefers its light value and falls back to the dark one.
 */
export const resolveBranding = (branding: BrandingDto | null | undefined): ResolvedBranding => ({
  appName: branding?.appName || import.meta.env.VITE_APP_NAME || undefined,
  companyName: branding?.companyName || import.meta.env.VITE_COMPANY_NAME || undefined,
  companyLogoUrlLight: branding?.companyLogoUrlLight || undefined,
  companyLogoUrlDark: branding?.companyLogoUrlDark || undefined,
  productLogoUrlLight: branding?.productLogoUrlLight || undefined,
  productLogoUrlDark: branding?.productLogoUrlDark || undefined,
  shortLogoUrlLight: branding?.shortLogoUrlLight || undefined,
  shortLogoUrlDark: branding?.shortLogoUrlDark || undefined,
  faviconUrlLight: branding?.faviconUrlLight || undefined,
  faviconUrlDark: branding?.faviconUrlDark || undefined,
  background: branding?.backgroundColor || undefined,
  foreground: branding?.foregroundColor || undefined,
  primary: branding?.primaryColor || undefined,
  primaryForeground: branding?.primaryForegroundColor || undefined,
  secondary: branding?.secondaryColor || undefined,
  secondaryForeground: branding?.secondaryForegroundColor || undefined,
  accent: branding?.accentColor || undefined,
  accentForeground: branding?.accentForegroundColor || undefined,
});

interface BrandingStore {
  /** The deployment branding returned by the API; null until loaded or when unavailable. */
  branding: BrandingDto | null;

  /** Stores the fetched deployment branding. */
  setBranding: (branding: BrandingDto | null) => void;
}

const useBrandingStore = create<BrandingStore>((set) => ({
  branding: null,
  setBranding: (branding) => set({ branding }),
}));

export { useBrandingStore };
