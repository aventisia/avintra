/**
 * Redirects the user to the login page after a delay of 2 seconds.
 *
 * This function checks if the application is not in development mode
 * (`import.meta.env.DEV` is false). If so, it redirects the user to the
 * login URL specified in the environment variable `VITE_LOGIN_URL`.
 *
 * @remarks
 * The redirection is delayed by 2 seconds using `setTimeout`.
 */
export function redirectToLoginUtil() {
  setTimeout(() => {
    if (!import.meta.env.DEV)
      window.location.assign(import.meta.env.VITE_LOGIN_URL);
  }, 2000);
}
