import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  forgetDesktopIntent,
  getDesktopConfirmationAppPath,
  getDesktopConfirmationPath,
  getDesktopIntent,
  hasDesktopIntent,
  isSwitchingDesktopAccount,
  rememberDesktopIntent,
} from "../desktop-intent.util";

const location = { search: "" };
const stored = new Map<string, string>();

const STATE = "s".repeat(20);
const CHALLENGE = "c".repeat(43);

const intentQuery = (overrides: Record<string, string> = {}) =>
  `?${new URLSearchParams({
    intent: "desktop",
    state: STATE,
    challenge: CHALLENGE,
    port: "48921",
    computer: "Laptop",
    ...overrides,
  })}`;

const expectedIntent = (overrides: Record<string, string> = {}) => ({
  state: STATE,
  challenge: CHALLENGE,
  port: "48921",
  computer: "Laptop",
  ...overrides,
});

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
  vi.restoreAllMocks();
});

describe("getDesktopIntent", () => {
  it("reads a valid desktop attempt from the query string", () => {
    location.search = intentQuery();

    expect(getDesktopIntent()).toEqual(expectedIntent());
    expect(hasDesktopIntent()).toBe(true);
  });

  it("ignores a page without a desktop attempt", () => {
    location.search = intentQuery({ intent: "other" });

    expect(getDesktopIntent()).toBeNull();
    expect(hasDesktopIntent()).toBe(false);
  });

  it("rejects a state or challenge outside the URL-safe attempt format", () => {
    location.search = intentQuery({ state: "s".repeat(19) });
    expect(getDesktopIntent()).toBeNull();

    location.search = intentQuery({ state: `${STATE}!` });
    expect(getDesktopIntent()).toBeNull();

    location.search = intentQuery({ challenge: "c".repeat(19) });
    expect(getDesktopIntent()).toBeNull();
  });

  it("rejects a port outside the loopback range", () => {
    for (const port of ["0", "65536", "-1", "80a"]) {
      location.search = intentQuery({ port });
      expect(getDesktopIntent()).toBeNull();
    }

    location.search = intentQuery({ port: "65535" });
    expect(getDesktopIntent()).toEqual(expectedIntent({ port: "65535" }));
  });

  it("strips control characters and bounds the computer name", () => {
    location.search = intentQuery({ computer: "  Work\u0007station  " });
    expect(getDesktopIntent()?.computer).toBe("Workstation");

    location.search = intentQuery({ computer: "x".repeat(70) });
    expect(getDesktopIntent()?.computer).toBe("x".repeat(64));

    location.search = intentQuery({ computer: "\u0000\u0007" });
    expect(getDesktopIntent()?.computer).toBe("this computer");
  });
});

describe("remembered desktop attempt", () => {
  it("survives losing the query string", () => {
    location.search = intentQuery();
    rememberDesktopIntent();
    location.search = "";

    expect(getDesktopIntent()).toEqual(expectedIntent());
  });

  it("prefers the current query string over the remembered attempt", () => {
    location.search = intentQuery();
    rememberDesktopIntent();
    location.search = intentQuery({ state: "q".repeat(20) });

    expect(getDesktopIntent()?.state).toBe("q".repeat(20));
  });

  it("expires after the attempt lifetime", () => {
    location.search = intentQuery();
    rememberDesktopIntent();
    location.search = "";

    const now = vi.spyOn(Date, "now").mockReturnValue(Date.now() + 11 * 60 * 1000);
    expect(getDesktopIntent()).toBeNull();
    expect(stored.size).toBe(0);
    now.mockRestore();
  });

  it("drops a remembered attempt that fails validation", () => {
    location.search = intentQuery();
    rememberDesktopIntent();
    location.search = "";

    const [key] = [...stored.keys()];
    const saved = JSON.parse(stored.get(key)!) as Record<string, unknown>;
    stored.set(key, JSON.stringify({ ...saved, port: "0" }));

    expect(getDesktopIntent()).toBeNull();
    expect(stored.has(key)).toBe(false);
  });

  it("forgets the attempt once it is delivered", () => {
    location.search = intentQuery();
    rememberDesktopIntent();
    forgetDesktopIntent();
    location.search = "";

    expect(getDesktopIntent()).toBeNull();
  });
});

describe("desktop paths", () => {
  const accountsBase = "/accounts";
  const expectedParams = `intent=desktop&state=${STATE}&challenge=${CHALLENGE}&port=48921&computer=Laptop`;

  it("builds the confirmation page from a live attempt", () => {
    location.search = intentQuery();

    expect(getDesktopConfirmationAppPath()).toBe(
      `${accountsBase}/desktop/confirm?${expectedParams}`,
    );
    expect(getDesktopConfirmationPath()).toBe(`/desktop/confirm?${expectedParams}`);
  });

  it("has no confirmation page outside a hand-back", () => {
    expect(getDesktopConfirmationAppPath()).toBeNull();
    expect(getDesktopConfirmationPath()).toBeNull();
  });

  it("detects the use-different-account start", () => {
    expect(isSwitchingDesktopAccount("?switch=1")).toBe(true);
    expect(isSwitchingDesktopAccount("?switch=0")).toBe(false);
  });
});
