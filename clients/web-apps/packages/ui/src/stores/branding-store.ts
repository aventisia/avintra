import { create } from "zustand";

import type { BrandingDto } from "@/ui/dtos/response/branding-dto";

/** Effective branding after applying build-time Vite fallbacks to the fetched values. */
export type ResolvedBranding = {
  appName?: string;
  companyName?: string;
  logoUrl?: string;
  fullLogoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

/**
 * Resolves the effective branding: the API value wins, the build-time Vite defaults fill
 * the name fields, and unset logo/color fields stay undefined.
 *
 * IMPORTANT NOTE: light/dark logo variants are not differentiated yet. A single logo is resolved
 * (`logoUrl`, falling back to `logoUrlDark`) and `fullLogoUrl` is only used where the full
 * wordmark is shown; when it is unset the compact logo is reused.
 */
export const resolveBranding = (branding: BrandingDto | null | undefined): ResolvedBranding => ({
  appName: branding?.appName || import.meta.env.VITE_APP_NAME || undefined,
  companyName: branding?.companyName || import.meta.env.VITE_COMPANY_NAME || undefined,
  logoUrl: branding?.logoUrl || branding?.logoUrlDark || undefined,
  fullLogoUrl: branding?.fullLogoUrl || undefined,
  faviconUrl: branding?.faviconUrl || undefined,
  primaryColor: branding?.primaryColor || undefined,
  secondaryColor: branding?.secondaryColor || undefined,
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
