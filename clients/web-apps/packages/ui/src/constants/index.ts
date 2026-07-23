/**
 * Indicates whether the application is running in a Tauri environment.
 *
 * This constant checks if the `window` object contains the `isTauri` property,
 * which is typically injected by Tauri. It can be used to conditionally execute
 * code specific to Tauri or web environments.
 */
const IS_TAURI = "isTauri" in window;

/**
 * A fallback text to be displayed when a value is not available or undefined.
 * This is used in various components to provide a consistent placeholder for missing data.
 */
const FALLBACK_VALUE = "-";

/**
 * Local storage key for storing user preferences.
 * This key is used to save and retrieve user-specific settings
 * from the browser's local storage.
 */
const USER_PREFERENCES_LS_KEY = "userPreferences";

/**
 * Local storage key for storing the user session expiration status (true/false).
 */
const SESSION_EXPIRED_LS_KEY = "sessionExpired";

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
 * A constant string representing an error message for invalid credentials.
 * Basis this message flag we don't route user to login page on 401 error
 * Any change to the backend error message should be reflected here.
 */
const INVALID_CREDS = "Invalid credentials";

/**
 * The copyright text for Grapes Capital, dynamically including the current year.
 */
const COPYRIGHT_TEXT = `© ${new Date().getFullYear()} Aventisia Technologies Pvt Ltd. All Rights Reserved.`;

export {
  IS_TAURI,
  FALLBACK_VALUE,
  USER_PREFERENCES_LS_KEY,
  SESSION_EXPIRED_LS_KEY,
  USER_NAME_LS_KEY,
  REQUEST_TIMEOUT,
  INVALID_CREDS,
  COPYRIGHT_TEXT,
};
