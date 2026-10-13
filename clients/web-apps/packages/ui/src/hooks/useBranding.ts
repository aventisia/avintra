import { useShallow } from "zustand/react/shallow";

import { resolveBranding, useBrandingStore } from "@/ui/stores";

/**
 * Returns the effective deployment branding, applying the build-time Vite defaults
 * when the API value is unset. Logo/color fields stay undefined when not configured.
 */
const useBranding = () => {
  return useBrandingStore(useShallow((state) => resolveBranding(state.branding)));
};

export { useBranding };
