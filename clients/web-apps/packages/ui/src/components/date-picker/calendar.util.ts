import { format } from "date-fns";
import { type Locale, enUS } from "date-fns/locale";

/** Default +/- year range around today used by calendar year dropdowns. */
export const DEFAULT_YEAR_RANGE = 50;

export type MonthOption = {
  value: number;
  label: string;
};

export type YearOption = {
  value: number;
  label: string;
};

/**
 * Generates localized month options for the calendar month dropdown.
 * @param locale - date-fns locale object (options/localize/formatLong only).
 */
export function genMonths(
  locale?: Pick<Locale, "options" | "localize" | "formatLong">,
): MonthOption[] {
  const resolved = locale ?? enUS;
  return Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2021, i), "MMMM", { locale: resolved }),
  }));
}

/**
 * Generates year options centered on the current year.
 * @param yearRange - number of years before and after today. Default is 50.
 */
export function genYears(yearRange: number = DEFAULT_YEAR_RANGE): YearOption[] {
  const today = new Date();
  const startYear = today.getFullYear() - yearRange;
  return Array.from({ length: yearRange * 2 + 1 }, (_, i) => ({
    value: startYear + i,
    label: (startYear + i).toString(),
  }));
}

/** Returns the earliest selectable date for the given year range. */
export function getStartDate(yearRange: number = DEFAULT_YEAR_RANGE): Date {
  const today = new Date();
  return new Date(today.getFullYear() - yearRange, 0, 1);
}

/** Returns the latest selectable date for the given year range. */
export function getEndDate(yearRange: number = DEFAULT_YEAR_RANGE): Date {
  const today = new Date();
  return new Date(today.getFullYear() + yearRange, 11, 31);
}

/**
 * Whether left (previous) navigation should be disabled for a given displayed month.
 * @param month - currently displayed month.
 * @param yearRange - year range used by the calendar.
 */
export function isLeftNavigationDisabled(
  month: Date | undefined,
  yearRange: number = DEFAULT_YEAR_RANGE,
): boolean {
  if (!month) return false;
  const startDate = getStartDate(yearRange);
  return (
    month.getMonth() === startDate.getMonth() && month.getFullYear() === startDate.getFullYear()
  );
}

/**
 * Whether right (next) navigation should be disabled for a given displayed month.
 * @param month - currently displayed month.
 * @param yearRange - year range used by the calendar.
 */
export function isRightNavigationDisabled(
  month: Date | undefined,
  yearRange: number = DEFAULT_YEAR_RANGE,
): boolean {
  if (!month) return false;
  const endDate = getEndDate(yearRange);
  return month.getMonth() === endDate.getMonth() && month.getFullYear() === endDate.getFullYear();
}

/**
 * Normalizes a locale into the minimal shape needed by `genMonths`.
 * Falls back to `enUS` when incomplete.
 */
export function getValidLocale(
  locale?: Partial<Locale>,
): Pick<Locale, "options" | "localize" | "formatLong"> {
  if (locale?.options && locale.localize && locale.formatLong) {
    return {
      options: locale.options,
      localize: locale.localize,
      formatLong: locale.formatLong,
    };
  }
  return enUS;
}

/** Casts a DayPicker locale to the minimal shape needed by date-fns format. */
export function toDateFnsLocale(
  locale: Partial<Locale> | undefined,
): Pick<Locale, "options" | "localize" | "formatLong"> {
  return getValidLocale(locale);
}
