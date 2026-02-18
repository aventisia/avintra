import { CrudActionType } from "@aventisia/ui/types";

/**
 * A constant string representing an message which user will get from backend when 2FA is enabled.
 * Any change to the backend error message should be reflected here.
 */
const TWO_FA_ENABLED = "TwoFA is enabled";

/**
 * A constant string representing an message which user will get from backend when password is expired.
 * Any change to the backend error message should be reflected here.
 */
const PWD_EXPIRED = "Your password has been expired";

/**
 * A constant string representing an error message for invalid credentials.
 * Basis this message flag we don't route user to login page on 401 error
 * Any change to the backend error message should be reflected here.
 */
const INVALID_CREDS = "Invalid credentials";

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
 * The copyright text for Grapes Capital, dynamically including the current year.
 */
const COPYRIGHT_TEXT = `© ${new Date().getFullYear()} Aventisia Technologies Pvt Ltd. All Rights Reserved.`;

export {
  TWO_FA_ENABLED,
  PWD_EXPIRED,
  INVALID_CREDS,
  USER_PREFERENCES_LS_KEY,
  SESSION_EXPIRED_LS_KEY,
  USER_NAME_LS_KEY,
  REQUEST_TIMEOUT,
  COPYRIGHT_TEXT,
};

export const CrudActionTypeLong: {
  [key: string]: CrudActionType;
} = {
  c: "create",
  r: "read",
  u: "update",
  d: "delete",
};

export const CrudActionTypeShort: {
  [key in CrudActionType]: string;
} = {
  create: "c",
  read: "r",
  update: "u",
  delete: "d",
  "delete-multiple": "m",
};
