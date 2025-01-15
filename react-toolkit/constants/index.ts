/**
 * Local storage key for storing user preferences.
 * This key is used to save and retrieve user-specific settings
 * from the browser's local storage.
 */
const USER_PREFERENCES_LS_KEY = "userPreferences";

/**
 * Key used to store the user session information in the local storage.
 */
const USER_SESSION_LS_KEY = "userSession";

/**
 * Local storage key for the development JSON Web Token (JWT).
 * This key is used to store the JWT in the browser's local storage
 * during development.
 */
const DEV_JWT_LS_KEY = "dev_jwt";

/**
 * The key used to store the user's username in the local storage.
 */
const USER_NAME_LS_KEY = "userName";

/**
 * The amount of time, in milliseconds, before a request times out.
 * This constant is used to set the maximum duration for HTTP requests.
 */
const REQUEST_TIMEOUT = 30000;

/**
 * The copyright text for Grapes Capital, dynamically including the current year.
 */
const COPYRIGHT_TEXT = `© ${new Date().getFullYear()} Aventisia Technologies Pvt Ltd. All Rights Reserved.`;

export {
  USER_PREFERENCES_LS_KEY,
  USER_SESSION_LS_KEY,
  DEV_JWT_LS_KEY,
  USER_NAME_LS_KEY,
  REQUEST_TIMEOUT,
  COPYRIGHT_TEXT,
};
