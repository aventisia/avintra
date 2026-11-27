import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rememberDesktopIntent } from "../desktop-intent.util";
import { buildOnboardingUrl } from "../post-login-destination";

const location = { search: "" };
const stored = new Map<string, string>();

const STATE = "s".repeat(20);
const CHALLENGE = "c".repeat(43);
const desktopParams = `intent=desktop&state=${STATE}&challenge=${CHALLENGE}&port=48921&computer=Laptop`;

const intentQuery = () => `?${desktopParams}`;
const onboarding = "/accounts/onboarding";

beforeEach(() => {
  location.search = "";
  stored.clear();
  vi.stubEnv("VITE_ACCOUNTS_PATH", "/accounts/");
  vi.stubGlobal("window", { location });
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => void stored.set(key, value),
    removeItem: (key: string) => void stored.delete(key),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("buildOnboardingUrl", () => {
  it("keeps a chosen plan from the current query", () => {
    location.search = "?plan=Team&currency=USD&frequency=yearly";

    expect(buildOnboardingUrl()).toBe(`${onboarding}?plan=Team&currency=USD&frequency=yearly`);
  });

  it("adds the fallback plan when the provider round trip lost the query", () => {
    expect(buildOnboardingUrl(true)).toBe(`${onboarding}?plan=Pro`);
  });

  it("does not overwrite a plan that is still known", () => {
    location.search = "?plan=Team";

    expect(buildOnboardingUrl(true)).toBe(`${onboarding}?plan=Team`);
  });

  it("keeps the fallback plan alongside a desktop hand-back", () => {
    location.search = intentQuery();
    rememberDesktopIntent();
    location.search = "";

    expect(buildOnboardingUrl(true)).toBe(`${onboarding}?plan=Pro&${desktopParams}`);
  });
});
