import { ISelectOption } from "@aventisia/ui/types";
import Enumerable from "linq";
import timezones from "timezones-list";

// Array of days and their corresponding numbers
const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const numbers = [1, 2, 3, 4, 5, 6, 7];

/**
 * Maps an array of weekday strings to their corresponding numeric values (1-7).
 */
function weekdaysToNumbers(weekdaysArray: string[] | undefined): number[] {
  if (!weekdaysArray || weekdaysArray.length === 0) return [];
  return weekdaysArray.map((day) => {
    const index = weekdays.indexOf(day);
    if (index === -1)
      throw new Error(`Invalid weekday string provided: ${day}`);
    return numbers[index];
  });
}

/**
 * Maps an array of numeric weekdays (1-7) back to their string representations.
 */
function numbersToWeekdays(numbersArray: number[] | undefined): string[] {
  if (!numbersArray || numbersArray.length === 0) return [];
  return numbersArray.map((num) => {
    const index = numbers.indexOf(num);
    if (index === -1)
      throw new Error(`Invalid weekday number provided: ${num}`);
    return weekdays[index];
  });
}

/**
 * Generates dropdown options for minute intervals (1 to 59).
 */
const generateMinutesOptions = (): ISelectOption[] =>
  Array.from({ length: 59 }, (_, i) => ({
    label: `${i + 1} minute${i === 0 ? "" : "s"}`,
    value: (i + 1).toString(),
  }));

/**
 * Generates options representing specific minutes past an hour.
 * Uses '00:MM' format to trick standard time inputs into passing just the minute data.
 */
const generateHourMinutesOptions = (): ISelectOption[] =>
  Array.from({ length: 60 }, (_, i) => ({
    label: `${i} minute${i === 1 ? "" : "s"}`,
    value: `00:${String(i).padStart(2, "0")}`,
  }));

/**
 * Generates dropdown options for month intervals (1 to 12).
 */
const generateMonthOptions = (): ISelectOption[] =>
  Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1} month${i === 0 ? "" : "s"}`,
    value: (i + 1).toString(),
  }));

const generateDayOfWeekOptions = (): ISelectOption[] => [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

/**
 * Generates dropdown options for days of the month (1 to 31).
 */
const generateDayOfMonthOptions = (): ISelectOption[] =>
  Array.from({ length: 31 }, (_, i) => ({
    label: `${i + 1} day${i === 0 ? "" : "s"}`,
    value: (i + 1).toString(),
  }));

/**
 * Generates dropdown options for hour intervals (1 to 23).
 */
const generateHourlyOptions = (): ISelectOption[] =>
  Array.from({ length: 23 }, (_, i) => ({
    label: `${i + 1} hour${i === 0 ? "" : "s"}`,
    value: (i + 1).toString(),
  }));

/**
 * Formats a 24-hour integer into a 12-hour AM/PM string.
 */
const formatHour = (h: number): string => {
  const hour = h % 12 === 0 ? 12 : h % 12;
  const period = h < 12 || h === 24 ? "AM" : "PM";
  return `${hour} ${period}`;
};

/**
 * Generates options mapping specific hour ranges for exception configurations.
 */
const generateHourlyWithRangeOptions = (): ISelectOption[] =>
  Array.from({ length: 24 }, (_, i) => {
    const start = i; // Adjusted to allow 12 AM (0) as a start
    const end = start + 1;
    return {
      label: `${formatHour(start || 24)} to ${formatHour(end)}`,
      value: start.toString(),
    };
  });

const timezoneOptions = Enumerable.from(timezones)
  .select<ISelectOption>((t) => ({
    value: t.tzCode,
    label: t.label,
  }))
  .toArray();

/**
 * Extracts time in strictly "HH:mm" format from a JavaScript Date object.
 */
function getTimeFromDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Clones a Date object and applies a new time derived from an "HH:mm" string.
 */
function setTimeToDate(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}
export {
  weekdaysToNumbers,
  numbersToWeekdays,
  generateDayOfMonthOptions,
  generateDayOfWeekOptions,
  generateHourlyOptions,
  generateHourlyWithRangeOptions,
  generateHourMinutesOptions,
  generateMinutesOptions,
  generateMonthOptions,
  timezoneOptions,
  getTimeFromDate,
  setTimeToDate,
};
