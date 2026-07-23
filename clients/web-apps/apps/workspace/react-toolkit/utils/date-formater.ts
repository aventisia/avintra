import {
  FormatDistanceToNowOptions,
  format,
  formatDistanceToNow,
  isAfter,
  isValid,
} from "date-fns";

export const DATE_MIN = new Date(1, 1, 1);

/**
 * returns a formatted date
 *
 * @param {(Date | undefined | null)} date
 * @param {string} [dateFormat="dd MMM yyyy"]
 * @param {string} [placeholder="NA"]
 * @return placeholder
 */
export const dateFormatter = (
  date: Date,
  dateFormat: string = "dd MMM yyyy",
  placeholder: string = "NA",
) => (isValid(date) && isAfter(date, DATE_MIN) ? format(date, dateFormat) : placeholder);

/**
 * return a human distace time
 *
 * @param {(Date | undefined | null)} date
 * @param {string} [placeholder="NA"]
 * @param {FormatDistanceToNowOptions} [formatToNowOptions={addSuffix: true,}]
 * @return placeholder
 */
export const dateFormatterDistanceToNow = (
  date: Date,
  placeholder: string = "NA",
  formatToNowOptions: FormatDistanceToNowOptions = {
    addSuffix: true,
  },
) => (isAfter(date, DATE_MIN) ? formatDistanceToNow(date, formatToNowOptions) : placeholder);
