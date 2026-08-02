import { toDate } from "date-fns";

import type { Period, TimePickerType } from "./types";

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

/** Clamps/pads a string integer into a two-digit value. */
export function getValidNumber(
  value: string,
  { max, min = 0, loop = false }: GetValidNumberConfig,
): string {
  let numericValue = parseInt(value, 10);

  if (Number.isNaN(numericValue)) return "00";

  if (!loop) {
    if (numericValue > max) numericValue = max;
    if (numericValue < min) numericValue = min;
  } else {
    if (numericValue > max) numericValue = min;
    if (numericValue < min) numericValue = max;
  }
  return numericValue.toString().padStart(2, "0");
}

/** Checks whether a string is a valid 24-hour hour (00-23). */
export function isValidHour(value: string): boolean {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

/** Checks whether a string is a valid 12-hour hour (01-12). */
export function isValid12Hour(value: string): boolean {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

/** Checks whether a string is a valid minute or second (00-59). */
export function isValidMinuteOrSecond(value: string): boolean {
  return /^[0-5][0-9]$/.test(value);
}

/** Returns a valid 24-hour hour string. */
export function getValidHour(value: string): string {
  if (isValidHour(value)) return value;
  return getValidNumber(value, { max: 23 });
}

/** Returns a valid 12-hour hour string. */
export function getValid12Hour(value: string): string {
  if (isValid12Hour(value)) return value;
  return getValidNumber(value, { min: 1, max: 12 });
}

/** Returns a valid minute/second string. */
export function getValidMinuteOrSecond(value: string): string {
  if (isValidMinuteOrSecond(value)) return value;
  return getValidNumber(value, { max: 59 });
}

type GetValidArrowNumberConfig = {
  min: number;
  max: number;
  step: number;
};

/** Adds a step to a value and wraps/clamps it. */
export function getValidArrowNumber(value: string, { min, max, step }: GetValidArrowNumberConfig): string {
  const numericValue = parseInt(value, 10);
  if (Number.isNaN(numericValue)) return "00";
  return getValidNumber(String(numericValue + step), { min, max, loop: true });
}

/** Arrow-stepped 24-hour hour. */
export function getValidArrowHour(value: string, step: number): string {
  return getValidArrowNumber(value, { min: 0, max: 23, step });
}

/** Arrow-stepped 12-hour hour. */
export function getValidArrow12Hour(value: string, step: number): string {
  return getValidArrowNumber(value, { min: 1, max: 12, step });
}

/** Arrow-stepped minute or second. */
export function getValidArrowMinuteOrSecond(value: string, step: number): string {
  return getValidArrowNumber(value, { min: 0, max: 59, step });
}

/** Sets minutes on a date mutably. */
export function setMinutes(date: Date, value: string): Date {
  const minutes = getValidMinuteOrSecond(value);
  date.setMinutes(parseInt(minutes, 10));
  return date;
}

/** Sets seconds on a date mutably. */
export function setSeconds(date: Date, value: string): Date {
  const seconds = getValidMinuteOrSecond(value);
  date.setSeconds(parseInt(seconds, 10));
  return date;
}

/** Sets 24-hour hours on a date mutably. */
export function setHours(date: Date, value: string): Date {
  const hours = getValidHour(value);
  date.setHours(parseInt(hours, 10));
  return date;
}

/** Sets 12-hour hours on a date mutably. */
export function set12Hours(date: Date, value: string, period: Period): Date {
  const hours = parseInt(getValid12Hour(value), 10);
  const convertedHours = convert12HourTo24Hour(hours, period);
  date.setHours(convertedHours);
  return date;
}

/** Sets a time component on a date by type. */
export function setDateByType(date: Date, value: string, type: TimePickerType, period?: Period): Date {
  switch (type) {
    case "minutes":
      return setMinutes(date, value);
    case "seconds":
      return setSeconds(date, value);
    case "hours":
      return setHours(date, value);
    case "12hours":
      return period ? set12Hours(date, value, period) : date;
    default:
      return date;
  }
}

/** Reads the current value of a time component from a date as a two-digit string. */
export function getDateByType(date: Date | null, type: TimePickerType): string {
  if (!date) return "00";
  switch (type) {
    case "minutes":
      return getValidMinuteOrSecond(String(toDate(date).getMinutes()));
    case "seconds":
      return getValidMinuteOrSecond(String(toDate(date).getSeconds()));
    case "hours":
      return getValidHour(String(toDate(date).getHours()));
    case "12hours":
      return getValid12Hour(String(display12HourValue(toDate(date).getHours())));
    default:
      return "00";
  }
}

/** Arrow-steps a time component value by type. */
export function getArrowByType(value: string, step: number, type: TimePickerType): string {
  switch (type) {
    case "minutes":
    case "seconds":
      return getValidArrowMinuteOrSecond(value, step);
    case "hours":
      return getValidArrowHour(value, step);
    case "12hours":
      return getValidArrow12Hour(value, step);
    default:
      return "00";
  }
}

/**
 * Converts a 12-hour hour and period into a 24-hour hour.
 * 12:00 PM → 12, 12:00 AM → 0, 1 PM → 13.
 */
export function convert12HourTo24Hour(hour: number, period: Period): number {
  if (period === "PM") {
    return hour <= 11 ? hour + 12 : hour;
  }
  if (period === "AM") {
    return hour === 12 ? 0 : hour;
  }
  return hour;
}

/**
 * Displays a 24-hour hour in 12-hour form for the 12-hour input.
 * 0 or 12 → "12", 22 → "10", others → padded `hour % 12`.
 */
export function display12HourValue(hours: number): string {
  if (hours === 0 || hours === 12) return "12";
  if (hours >= 22) return `${hours - 12}`;
  if (hours % 12 > 9) return `${hours}`;
  return `0${hours % 12}`;
}
