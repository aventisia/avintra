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
const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

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

export { AVENTISIA_EMAIL_DOMAIN, getPostLoginDestination };
