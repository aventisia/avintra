import {
  format,
  formatDistanceToNow,
  FormatDistanceToNowOptions,
  isAfter,
} from "date-fns";
import { CrudActionType } from "../types/literal-types";

const USER_PREFERENCES_LS_KEY = "userPreferences";
const USER_SESSION_LS_KEY = "userSession";
const DEV_JWT_LS_KEY = "dev_jwt";
const USER_NAME_LS_KEY = "userName";
const REQUEST_TIMEOUT = 30000;
const ARTIFICIAL_DELAY = 500;

export {
  USER_PREFERENCES_LS_KEY,
  USER_SESSION_LS_KEY,
  DEV_JWT_LS_KEY,
  USER_NAME_LS_KEY,
  REQUEST_TIMEOUT,
  ARTIFICIAL_DELAY,
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
