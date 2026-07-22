import { format } from "date-fns";

import { FALLBACK_VALUE } from "@/ui/constants";

/**
 * Formats a given date value into a human-readable string. If the value is invalid or not provided, it returns a fallback value.
 * @param value The date value to format. Can be a Date object, a string, a number, or null.
 * @param withTime Whether to include the time in the formatted output. Defaults to false.
 * @returns The formatted date string, or a fallback value if the input is invalid.
 */
export const formatDate = (value?: Date | string | number | null, withTime: boolean = false) => {
  if (!value) return FALLBACK_VALUE;

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return FALLBACK_VALUE;

  const formattedDate = withTime
    ? format(date, "dd MMM yyyy h:mm:ss a")
    : format(date, "dd MMM yyyy");

  // .NET default DateTime sentinel should not be shown in the UI.
  return formattedDate === "01 Jan 0001 12:00:00 AM" ? FALLBACK_VALUE : formattedDate;
};
