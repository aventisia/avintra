import { getBranding } from "@/ui/apis/branding-apis";
import { BRANDING_BOOT_TIMEOUT } from "@/ui/constants";
import { resolveBranding, useBrandingStore } from "@/ui/stores";
import { sleep } from "@/ui/utils";

import { applyBrandingToDocument } from "./apply-branding";

type BrandingResponse = Awaited<ReturnType<typeof getBranding>>;

/** Stores the brand response and applies it to the document. */
const applyBranding = (response: BrandingResponse): void => {
  const branding = response?.data ?? null;

  useBrandingStore.getState().setBranding(branding);
  applyBrandingToDocument(resolveBranding(branding));
};

/**
 * Fetches the deployment branding, stores it, and applies it to the document.
 *
 * @remarks
 * Call once before the first render (see each app's `main.tsx`) so the app boots already themed
 * and never flashes the default values. The boot waits at most `BRANDING_BOOT_TIMEOUT` for the
 * endpoint; a timeout or failure boots with the built-in defaults.
 *
 * IMPORTANT NOTE: a response slower than the timeout is not dropped. The app boots with the
 * defaults and re-themes once that late response arrives, so slow deployments still end up
 * branded without delaying the first paint.
 */
const bootstrapBranding = async (): Promise<void> => {
  const request = getBranding();

  // Set by the boot timeout so a late response can be re-applied after the app has rendered.
  let timedOut = false;
  const timeout = sleep(BRANDING_BOOT_TIMEOUT).then(() => {
    timedOut = true;
    return null;
  });

  // Boot with whatever the endpoint returns within the timeout; otherwise fall back to defaults.
  applyBranding(await Promise.race([request, timeout]));

  if (!timedOut) {
    return;
  }

  // Late arrival: re-apply after boot so a slow deployment still ends up branded. Detached on
  // purpose — awaiting the request here would delay the first render until it finally settles.
  void request.then(applyBranding);
};

export { bootstrapBranding };
