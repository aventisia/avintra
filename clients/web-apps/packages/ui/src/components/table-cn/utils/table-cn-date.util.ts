const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Formats a timestamp as a local `yyyy-MM-dd` calendar date.
 */
export const formatCalendarDate = (time: number) => {
  const date = new Date(time);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * Parses a local `yyyy-MM-dd` calendar date into the timestamp of its midnight.
 */
export const parseCalendarDate = (text: string): number | undefined => {
  const match = CALENDAR_DATE_PATTERN.exec(text.trim());
  if (!match) return undefined;

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  return isRealDate ? date.getTime() : undefined;
};

/**
 * Reads a cell or filter value (Date, timestamp, calendar date, or ISO string) as a timestamp.
 */
export const toTime = (value: unknown): number | undefined => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.getTime();
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string" || value.trim() === "") return undefined;

  const time = parseCalendarDate(value) ?? new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
};

export const startOfDay = (time: number) => new Date(time).setHours(0, 0, 0, 0);

export const endOfDay = (time: number) => new Date(time).setHours(23, 59, 59, 999);
