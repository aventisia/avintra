import { rememberDesktopShellOrigin } from "@avplatform/ui/utils/redirect-util";

const URL_SAFE = /^[A-Za-z0-9_-]+$/;
const CODE_VERIFIER = /^[A-Za-z0-9_-]{43,128}$/;

type DesktopCallbackValues = { code: string; state: string; verifier: string };

let capturedValues: DesktopCallbackValues | null = null;

const stripFragment = () => {
  if (!window.location.hash) return;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
};

const parseFragment = (fragment: string): DesktopCallbackValues | null => {
  const params = new URLSearchParams(fragment.replace(/^#/, ""));
  const code = params.get("code") ?? "";
  const state = params.get("state") ?? "";
  const verifier = params.get("verifier") ?? "";

  if (!URL_SAFE.test(code) || !URL_SAFE.test(state) || !CODE_VERIFIER.test(verifier)) return null;

  return { code, state, verifier };
};

/**
 * Reads the sign-in fragment on the callback landing and clears it from the address bar before any
 * boot request runs, so the values never reach a server, a proxy log or a third-party request.
 */
const captureDesktopCallbackFragment = (): void => {
  if (!window.location.pathname.endsWith("/desktop/callback")) return;

  rememberDesktopShellOrigin(new URLSearchParams(window.location.search).get("shellOrigin"));

  const fragment = window.location.hash;
  stripFragment();
  capturedValues = fragment ? parseFragment(fragment) : null;
};

/** The values captured at boot, validated locally; `null` when the link is not a usable one. */
const getDesktopCallbackValues = (): DesktopCallbackValues | null => capturedValues;

/** The backend message for a failed exchange, read from the raw rejection the interceptor passes through. */
const getExchangeErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;

  const data = (error as { response?: { data?: unknown } } | null)?.response?.data;
  if (typeof data === "string" && data) return data;

  return "We could not finish signing you in.";
};

export { captureDesktopCallbackFragment, getDesktopCallbackValues, getExchangeErrorMessage };
export type { DesktopCallbackValues };
