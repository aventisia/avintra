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

/** True when the user arrived intending to buy a plan (a `plan` query param is present). */
const hasPlanIntent = (): boolean => new URLSearchParams(window.location.search).has("plan");

export {
  AVENTISIA_EMAIL_DOMAIN,
  getPostLoginDestination,
  hasPlanIntent,
  resolvePostLoginDestination,
};
