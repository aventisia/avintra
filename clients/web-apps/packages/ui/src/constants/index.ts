import type { CrudActionType } from "../types";

/**
 * A constant string representing a message which user will receive from the backend when tenant setup is incomplete.
 * This message is shown after user signup or account creation, until company (tenant) details are completed.
 * Any change to the backend message should be reflected here.
 */
const ADD_TENANT = "Complete organization setup to continue.";

/**
 * A constant string representing a message which the user will receive from the backend when no active subscription (plan) is found.
 * This is used to check if the tenant has a valid plan associated with the account.
 * Any change to the backend message should be reflected here.
 */
const NO_ACTIVE_SUBSCRIPTION = "Tenant has no active subscription.";

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

const CrudActionTypeLong: {
  [key: string]: CrudActionType;
} = {
  c: "create",
  r: "read",
  u: "update",
  d: "delete",
};

const CrudActionTypeShort: {
  [key in CrudActionType]: string;
} = {
  create: "c",
  read: "r",
  update: "u",
  delete: "d",
  "delete-multiple": "m",
};

export {
  ADD_TENANT,
  NO_ACTIVE_SUBSCRIPTION,
  IS_TAURI,
  FALLBACK_VALUE,
  USER_PREFERENCES_LS_KEY,
  SESSION_EXPIRED_LS_KEY,
  USER_NAME_LS_KEY,
  REQUEST_TIMEOUT,
  INVALID_CREDS,
  COPYRIGHT_TEXT,
  CrudActionTypeLong,
  CrudActionTypeShort,
};
