import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { rememberDesktopShellOrigin } = vi.hoisted(() => ({
  rememberDesktopShellOrigin: vi.fn(),
}));

vi.mock("@avplatform/ui/utils/redirect-util", () => ({ rememberDesktopShellOrigin }));

const location = { pathname: "/accounts/desktop/callback", search: "", hash: "" };
const replaceState = vi.fn();

type CallbackUtil = typeof import("../desktop-callback.util");
let callbackUtil: CallbackUtil;

const VERIFIER = "v".repeat(43);
const validFragment = `#code=abc_DEF&state=${"s".repeat(20)}&verifier=${VERIFIER}`;

beforeEach(async () => {
  vi.resetModules();
  rememberDesktopShellOrigin.mockClear();
  replaceState.mockClear();
  location.pathname = "/accounts/desktop/callback";
  location.search = "";
  location.hash = "";

  vi.stubGlobal("window", { location, history: { replaceState } });

  callbackUtil = await import("../desktop-callback.util");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("captureDesktopCallbackFragment", () => {
  it("captures a valid fragment and clears it from the address bar", () => {
    location.search = "?shellOrigin=tauri%3A%2F%2Flocalhost";
    location.hash = validFragment;

    callbackUtil.captureDesktopCallbackFragment();

    expect(callbackUtil.getDesktopCallbackValues()).toEqual({
      code: "abc_DEF",
      state: "s".repeat(20),
      verifier: VERIFIER,
    });
    expect(replaceState).toHaveBeenCalledWith(
      null,
      "",
      "/accounts/desktop/callback?shellOrigin=tauri%3A%2F%2Flocalhost",
    );
    expect(rememberDesktopShellOrigin).toHaveBeenCalledWith("tauri://localhost");
  });

  it("rejects a tampered fragment but still remembers the shell", () => {
    location.search = "?shellOrigin=http%3A%2F%2Ftauri.localhost";
    location.hash = "#code=abc DEF&state=short&verifier=missing";

    callbackUtil.captureDesktopCallbackFragment();

    expect(callbackUtil.getDesktopCallbackValues()).toBeNull();
    expect(replaceState).toHaveBeenCalled();
    expect(rememberDesktopShellOrigin).toHaveBeenCalledWith("http://tauri.localhost");
  });

  it("returns no values when the fragment is missing", () => {
    callbackUtil.captureDesktopCallbackFragment();

    expect(callbackUtil.getDesktopCallbackValues()).toBeNull();
  });

  it("ignores other pages and their query string", () => {
    location.pathname = "/accounts/login";
    location.search = "?shellOrigin=tauri%3A%2F%2Flocalhost";

    callbackUtil.captureDesktopCallbackFragment();

    expect(callbackUtil.getDesktopCallbackValues()).toBeNull();
    expect(replaceState).not.toHaveBeenCalled();
    expect(rememberDesktopShellOrigin).not.toHaveBeenCalled();
  });
});

describe("getExchangeErrorMessage", () => {
  it("keeps the backend message from a plain-text failure", () => {
    expect(
      callbackUtil.getExchangeErrorMessage({
        response: { data: "Invalid or expired desktop sign-in code." },
      }),
    ).toBe("Invalid or expired desktop sign-in code.");
  });

  it("keeps a string rejection", () => {
    expect(callbackUtil.getExchangeErrorMessage("Sign-in was refused.")).toBe(
      "Sign-in was refused.",
    );
  });

  it("falls back to a generic message", () => {
    expect(callbackUtil.getExchangeErrorMessage(new Error("Network Error"))).toBe(
      "We could not finish signing you in.",
    );
    expect(
      callbackUtil.getExchangeErrorMessage({ response: { data: { title: "Bad Request" } } }),
    ).toBe("We could not finish signing you in.");
  });
});
