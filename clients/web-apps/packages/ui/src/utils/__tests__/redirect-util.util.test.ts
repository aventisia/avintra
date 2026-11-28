import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSessionEndedUrl, rememberDesktopShellOrigin } from "../redirect-util";

const stored = new Map<string, string>();

beforeEach(() => {
  stored.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => void stored.set(key, value),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("rememberDesktopShellOrigin", () => {
  it("returns to the desktop shell that reported itself", () => {
    rememberDesktopShellOrigin("http://tauri.localhost");

    expect(getSessionEndedUrl()).toBe("http://tauri.localhost");
  });

  it("returns to a development shell on its own port", () => {
    rememberDesktopShellOrigin("http://localhost:2999");

    expect(getSessionEndedUrl()).toBe("http://localhost:2999");
  });

  it("returns to the macOS and Linux desktop shell", () => {
    rememberDesktopShellOrigin("tauri://localhost");

    expect(getSessionEndedUrl()).toBe("tauri://localhost");
  });

  it("ignores an address outside the desktop shell", () => {
    rememberDesktopShellOrigin("https://example.com");

    expect(getSessionEndedUrl()).not.toBe("https://example.com");
  });

  it("falls back to the Windows shell address", () => {
    vi.stubEnv("DEV", false);
    vi.stubGlobal("navigator", { platform: "Win32" });

    expect(getSessionEndedUrl()).toBe("http://tauri.localhost");
  });

  it("falls back to the macOS and Linux shell address", () => {
    vi.stubEnv("DEV", false);
    vi.stubGlobal("navigator", { platform: "MacIntel" });

    expect(getSessionEndedUrl()).toBe("tauri://localhost");
  });
});
