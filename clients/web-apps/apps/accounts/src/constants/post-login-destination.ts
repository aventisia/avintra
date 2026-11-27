import { withDesktopIntent } from "./desktop-intent.util";

/**
 * The email domain that identifies Aventisia employees. Users logging in with
 * this domain are routed to the Atlas app; everyone else goes to the workspace app.
 */
const AVENTISIA_EMAIL_DOMAIN = "@aventisia.com";

/**
 * Indicates whether the app is running inside the Tauri desktop shell.
 *
 * Tauri v2 injects the `__TAURI_INTERNALS__` global into the webview, so this is
 * the reliable signal (the older `"isTauri" in window` check is not set by Tauri v2).
 */
const isTauri = (): boolean => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/**
 * Determines the post-login destination app path.
 *
 * - When running inside the Tauri desktop app → Workspace app (straight to workspace)
 * - Otherwise (browser):
 *   - Emails ending in `@aventisia.com` (Aventisia employees) → Atlas app
 *   - All other users → Workspace app
 *
 * @param email The user's email address (from the decoded JWT `uname`).
 * @returns The base path of the destination app (e.g. `/atlas/` or `/workspace/`).
 */
const getPostLoginDestination = (email: string): string => {
  // Desktop (Tauri) users always go straight to the workspace app.
  if (isTauri()) {
    return import.meta.env.VITE_WORKSPACE_PATH;
  }

  const normalizedEmail = email?.toLowerCase() ?? "";
  return normalizedEmail.endsWith(AVENTISIA_EMAIL_DOMAIN)
    ? import.meta.env.VITE_ATLAS_PATH
    : import.meta.env.VITE_WORKSPACE_PATH;
};

const getSameOriginRedirect = (): string | null => {
  try {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (!redirect) return null;

    const url = new URL(decodeURIComponent(redirect), window.location.origin);
    return url.origin === window.location.origin ? url.href : null;
  } catch {
    return null;
  }
};

/**
 * Resolves where to send a signed-in user: the same-origin `redirect` query param when present,
 * otherwise the default app for their email.
 */
const resolvePostLoginDestination = (email: string): string =>
  getSameOriginRedirect() ?? getPostLoginDestination(email);

/** True when the user arrived intending to buy a paid plan (a `plan` query param other than Starter). */
const hasPlanIntent = (): boolean => {
  const plan = new URLSearchParams(window.location.search).get("plan");
  return plan !== null && plan.toLowerCase() !== "starter";
};

/** Query keys that describe the chosen paid plan and survive the move to onboarding. */
const ONBOARDING_QUERY_KEYS = ["plan", "currency", "frequency"];

/**
 * Builds the onboarding URL, keeping the chosen plan, currency and frequency from the
 * current query string. Social sign-in loses the query on the provider round trip, so
 * callers with a server-confirmed intent pass `fallbackPlan` to land on a generic Pro
 * checkout instead of bouncing back to workspace. A desktop hand-back keeps its attempt
 * through onboarding so the confirmation is reached after the plan step.
 */
const buildOnboardingUrl = (fallbackPlan = false): string => {
  const kept = new URLSearchParams();
  const current = new URLSearchParams(window.location.search);
  for (const key of ONBOARDING_QUERY_KEYS) {
    const value = current.get(key);
    if (value) kept.set(key, value);
  }
  if (fallbackPlan && !kept.has("plan")) kept.set("plan", "Pro");
  withDesktopIntent(kept);
  const base = `${import.meta.env.VITE_ACCOUNTS_PATH}onboarding`;
  const search = kept.toString();
  return search ? `${base}?${search}` : base;
};

export {
  AVENTISIA_EMAIL_DOMAIN,
  buildOnboardingUrl,
  getPostLoginDestination,
  hasPlanIntent,
  resolvePostLoginDestination,
};
