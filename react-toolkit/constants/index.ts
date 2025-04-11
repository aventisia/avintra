import {
  format,
  formatDistanceToNow,
  FormatDistanceToNowOptions,
  isAfter,
} from "date-fns";

import { CurrencyTypesEnum } from "../enums/currency-types-enum";
import { CrudActionType } from "../types/literal-types";

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
  TWO_FA_ENABLED,
  PWD_EXPIRED,
  INVALID_CREDS,
  USER_PREFERENCES_LS_KEY,
  SESSION_EXPIRED_LS_KEY,
  DEV_JWT_LS_KEY,
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

export const DATE_MIN = new Date(1, 1, 1);

/**
 * returns a formatted date
 *
 * @param {(Date | undefined | null)} date
 * @param {string} [dateFormat="dd MMM yyyy"]
 * @param {string} [placeholder="NA"]
 * @return placeholder
 */
export const dateFormat = (
  date: Date,
  dateFormat: string = "dd MMM yyyy",
  placeholder: string = "NA",
) => (isAfter(date, DATE_MIN) ? format(date, dateFormat) : placeholder);

/**
 * return a human distace time
 *
 * @param {(Date | undefined | null)} date
 * @param {string} [placeholder="NA"]
 * @param {FormatDistanceToNowOptions} [formatToNowOptions={addSuffix: true,}]
 * @return placeholder
 */
export const dateFormatDistanceToNow = (
  date: Date,
  placeholder: string = "NA",
  formatToNowOptions: FormatDistanceToNowOptions = {
    addSuffix: true,
  },
) =>
  isAfter(date, DATE_MIN)
    ? formatDistanceToNow(date, formatToNowOptions)
    : placeholder;

export const popularCurrencies: Partial<
  Record<keyof typeof CurrencyTypesEnum, string>
> = {
  USD: "$", // United States Dollar
  EUR: "€", // Euro
  GBP: "£", // British Pound Sterling
  JPY: "¥", // Japanese Yen
  CHF: "CHF", // Swiss Franc
  CAD: "C$", // Canadian Dollar
  AUD: "A$", // Australian Dollar
  CNY: "¥", // Chinese Yuan
  INR: "₹", // Indian Rupee
  BRL: "R$", // Brazilian Real
  RUB: "₽", // Russian Ruble
  MXN: "MX$", // Mexican Peso
  SGD: "S$", // Singapore Dollar
  HKD: "HK$", // Hong Kong Dollar
  KRW: "₩", // South Korean Won
  ZAR: "R", // South African Rand
  TRY: "₺", // Turkish Lira
  NZD: "NZ$", // New Zealand Dollar
  SEK: "kr", // Swedish Krona
  NOK: "kr", // Norwegian Krone
  DKK: "kr", // Danish Krone
};

export const currencyFormater = (
  price: number,
  currency?: keyof typeof CurrencyTypesEnum | string | undefined,
) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (!currency) return `$${formatter.format(price)}`;

  if (popularCurrencies[currency as keyof typeof CurrencyTypesEnum]) {
    return `${popularCurrencies[currency as keyof typeof CurrencyTypesEnum]} ${formatter.format(price)}`;
  } else return `${formatter.format(price)} ${currency}`;
};
