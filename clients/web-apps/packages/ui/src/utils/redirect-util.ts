import { IS_TAURI, SESSION_EXPIRED_LS_KEY } from "@avplatform/ui/constants";

const DESKTOP_SHELL_ORIGIN_LS_KEY = "desktopShellOrigin";
const DESKTOP_SHELL_ORIGINS = [
  "http://localhost:2999",
  "http://tauri.localhost",
  "tauri://localhost",
];

/**
 * Remembers the desktop shell's own address, reported on the sign-in hand-back, so a session
 * that ends later returns to the shell that opened the page instead of guessing its address.
 */
export function rememberDesktopShellOrigin(origin: string | null): void {
  if (!origin || !DESKTOP_SHELL_ORIGINS.includes(origin)) return;

  try {
    localStorage.setItem(DESKTOP_SHELL_ORIGIN_LS_KEY, origin);
  } catch {
    // Storage can be unavailable; the build-mode fallback still applies.
  }
}

/**
 * Returns the desktop app's own address, where a Tauri webview goes back to for a fresh sign-in.
 *
 * @remarks
 * Remote pages never call into the desktop shell, so this is a plain navigation to the app origin.
 */
export function getSessionEndedUrl(): string {
  try {
    const stored = localStorage.getItem(DESKTOP_SHELL_ORIGIN_LS_KEY);
    if (stored && DESKTOP_SHELL_ORIGINS.includes(stored)) return stored;
  } catch {
    // Fall through to the build-mode guess.
  }

  if (import.meta.env.DEV) return "http://localhost:2999";

  // IMPORTANT NOTE: the desktop app sets a custom user agent, so only `platform` tells the shell schemes apart.
  return navigator.platform.startsWith("Win") ? "http://tauri.localhost" : "tauri://localhost";
}

/**
 * Redirects the user to the login page if a 401 Unauthorized response is detected.
 *
 * This function sets a local storage item "sessionExpired" to "true" to indicate that the session has expired.
 * It then redirects the user to the login page after a delay of 1 seconds, but only if the application is not in development mode.
 *
 * The login URL is retrieved from the environment variable `VITE_ACCOUNTS_PATH`.
 */
export function redirectToLoginOn401Util() {
  // Set identifier that session has expired
  localStorage.setItem(SESSION_EXPIRED_LS_KEY, "true");

  // Redirect to login page after 1 second if not in development mode
  setTimeout(() => {
    // IMPORTANT NOTE: a Tauri webview returns to the app's own origin, which shows the native
    // sign-in screen again; only a plain browser goes to the web login page.
    if (IS_TAURI) {
      window.location.assign(getSessionEndedUrl());
      return;
    }

    //Add current url as redirect query param
    const { href, pathname } = window.location;
    const isLogin = pathname.includes("/login");

    const accountsBase = import.meta.env.VITE_ACCOUNTS_PATH;

    const base = `${accountsBase}login`;

    const url = isLogin ? base : `${base}?redirect=${encodeURIComponent(href)}`;

    window.location.assign(url);
  }, 1000);
}
