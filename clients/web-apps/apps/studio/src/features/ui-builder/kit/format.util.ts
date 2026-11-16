const toNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toDate = (value: unknown) => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const EMPTY = "—";

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

/** Locale-aware formatters for numbers, money, percentages, dates, and durations. */
export const format = {
  number: (value: unknown, decimals?: number) => {
    const parsed = toNumber(value);
    return parsed === null
      ? EMPTY
      : parsed.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals ?? 2,
        });
  },
  compact: (value: unknown) => {
    const parsed = toNumber(value);
    return parsed === null
      ? EMPTY
      : new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(
          parsed,
        );
  },
  currency: (value: unknown, currency = "USD", decimals?: number) => {
    const parsed = toNumber(value);
    return parsed === null
      ? EMPTY
      : new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals ?? 2,
        }).format(parsed);
  },
  percent: (value: unknown, decimals = 1) => {
    const parsed = toNumber(value);
    return parsed === null
      ? EMPTY
      : new Intl.NumberFormat(undefined, {
          style: "percent",
          maximumFractionDigits: decimals,
        }).format(parsed);
  },
  date: (value: unknown, style: "short" | "medium" | "long" = "medium") => {
    const parsed = toDate(value);
    return parsed ? parsed.toLocaleDateString(undefined, { dateStyle: style }) : EMPTY;
  },
  dateTime: (value: unknown) => {
    const parsed = toDate(value);
    return parsed
      ? parsed.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
      : EMPTY;
  },
  time: (value: unknown) => {
    const parsed = toDate(value);
    return parsed ? parsed.toLocaleTimeString(undefined, { timeStyle: "short" }) : EMPTY;
  },
  relative: (value: unknown) => {
    const parsed = toDate(value);
    if (!parsed) return EMPTY;
    const seconds = (parsed.getTime() - Date.now()) / 1000;
    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    for (const [unit, size] of RELATIVE_UNITS) {
      if (Math.abs(seconds) >= size || unit === "second") {
        return formatter.format(Math.round(seconds / size), unit);
      }
    }
    return EMPTY;
  },
  duration: (milliseconds: unknown) => {
    const parsed = toNumber(milliseconds);
    if (parsed === null) return EMPTY;
    const totalSeconds = Math.round(Math.abs(parsed) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  },
};

/** Returns true when a value looks like an ISO date or date-time string. */
export const isDateLike = (value: unknown) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) && toDate(value) !== null;
