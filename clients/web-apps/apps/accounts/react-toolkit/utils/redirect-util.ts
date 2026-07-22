import { SESSION_EXPIRED_LS_KEY } from "@/react-toolkit/constants";

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
    //Add current url as redirect query param
    const { href, pathname } = window.location;
    const isLogin = pathname.includes("/login");

    const base = `${import.meta.env.VITE_ACCOUNTS_PATH}login`;

    const url = isLogin ? base : `${base}?redirect=${encodeURIComponent(href)}`;

    window.location.assign(url);
  }, 1000);
}
