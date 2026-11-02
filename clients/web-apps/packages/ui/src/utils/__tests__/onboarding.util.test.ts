import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearLocalStorageKeepingOnboarding,
  consumeFreshLogin,
  isOnboardingDue,
  markFreshLogin,
} from "../onboarding.util";

const NOW = 1_750_000_000_000;

describe("isOnboardingDue", () => {
  it("is due when the user has made no decision", () => {
    expect(isOnboardingDue({ disposition: null, snoozedUntil: null }, NOW)).toBe(true);
  });

  it("stays off after the guide is completed or dismissed", () => {
    expect(isOnboardingDue({ disposition: "completed", snoozedUntil: null }, NOW)).toBe(false);
    expect(isOnboardingDue({ disposition: "dismissed", snoozedUntil: null }, NOW)).toBe(false);
  });

  it("stays off until a snooze expires", () => {
    expect(isOnboardingDue({ disposition: null, snoozedUntil: NOW + 1 }, NOW)).toBe(false);
    expect(isOnboardingDue({ disposition: null, snoozedUntil: NOW }, NOW)).toBe(true);
    expect(isOnboardingDue({ disposition: null, snoozedUntil: NOW - 1 }, NOW)).toBe(true);
  });
});

describe("clearLocalStorageKeepingOnboarding", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps saved Get Started choices and clears everything else", () => {
    const entries = new Map([
      ["onboarding:admin@example.com", '{"state":{"disposition":"dismissed"}}'],
      ["payment_id", "pay_1"],
      ["country", "IN"],
    ]);
    vi.stubGlobal("localStorage", {
      get length() {
        return entries.size;
      },
      key: (index: number) => [...entries.keys()][index] ?? null,
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
      clear: () => entries.clear(),
    });

    clearLocalStorageKeepingOnboarding();

    expect([...entries]).toEqual([
      ["onboarding:admin@example.com", '{"state":{"disposition":"dismissed"}}'],
    ]);
  });
});

describe("fresh login marker", () => {
  beforeEach(() => {
    const entries = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
      removeItem: (key: string) => entries.delete(key),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("counts a recent sign-in exactly once", () => {
    markFreshLogin();
    expect(consumeFreshLogin()).toBe(true);
    expect(consumeFreshLogin()).toBe(false);
  });

  it("ignores a marker left by an older sign-in", () => {
    markFreshLogin();
    expect(consumeFreshLogin(Date.now() + 10 * 60 * 1000)).toBe(false);
  });
});
