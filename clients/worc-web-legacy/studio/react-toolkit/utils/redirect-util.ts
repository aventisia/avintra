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
    //Add current url and redirect query param
    const redirectUrl = encodeURIComponent(window.location.href);

    window.location.assign(
      `${import.meta.env.VITE_ACCOUNTS_PATH}login?redirect=${redirectUrl}`,
    );
  }, 1000);
}
