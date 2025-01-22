/**
 * Redirects the user to the login page if the application is not in development mode.
 *
 * This function checks if the application is running in development mode using the `import.meta.env.DEV` flag.
 * If the application is not in development mode, it redirects the user to the login URL specified in the
 * `import.meta.env.VITE_LOGIN_URL` environment variable after a delay of 2 seconds.
 */
export function redirectToLoginUtil() {
  // setTimeout(() => {
  //   if (import.meta.env.MODE !== "local")
  //     window.location.assign(import.meta.env.VITE_LOGIN_URL);
  // }, 2000);
}
