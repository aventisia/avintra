import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BRANDING_BOOT_TIMEOUT } from "@/ui/constants";
import { useBrandingStore } from "@/ui/stores";

import { bootstrapBranding } from "../bootstrap-branding";

const getBranding = vi.hoisted(() => vi.fn());

vi.mock("@/ui/apis/branding-apis", () => ({ getBranding }));

const brandedResponse = (appName: string) => ({
  data: { appName },
  statusCode: 200,
  message: null,
});

describe("bootstrapBranding", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getBranding.mockReset();
    useBrandingStore.getState().setBranding(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("boots with the response without waiting for the timeout", async () => {
    getBranding.mockResolvedValue(brandedResponse("Acme"));

    const boot = bootstrapBranding();
    await vi.advanceTimersByTimeAsync(0);
    await boot;

    expect(useBrandingStore.getState().branding).toEqual({ appName: "Acme" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("pins the boot timeout to one second", () => {
    expect(BRANDING_BOOT_TIMEOUT).toBe(1000);
  });

  it("boots with the defaults when the response is slower, then re-themes", async () => {
    let resolveLate: (value: unknown) => void = () => undefined;
    getBranding.mockReturnValue(
      new Promise((resolve) => {
        resolveLate = resolve;
      }),
    );

    const boot = bootstrapBranding();
    await vi.advanceTimersByTimeAsync(BRANDING_BOOT_TIMEOUT);
    await boot;

    expect(useBrandingStore.getState().branding).toBeNull();
    expect(vi.getTimerCount()).toBe(0);

    resolveLate(brandedResponse("Late"));
    await vi.advanceTimersByTimeAsync(0);

    expect(useBrandingStore.getState().branding).toEqual({ appName: "Late" });
  });
});
