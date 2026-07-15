import { format, isValid, parseISO } from "date-fns";

import type { DateRange } from "..";

export const DATE_FORMAT = "yyyy-MM-dd";

export const dateToParam = (date?: Date) =>
  date ? format(date, DATE_FORMAT) : undefined;

export const paramToDate = (value?: string | null) => {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
};

export const rangeToParams = (range?: DateRange) => ({
  from: dateToParam(range?.from),
  to: dateToParam(range?.to),
});

export const paramsToRange = (
  from?: string | null,
  to?: string | null,
): DateRange | undefined => {
  const fromDate = paramToDate(from);
  const toDate = paramToDate(to);

  if (!fromDate || !toDate) return undefined;

  return { from: fromDate, to: toDate };
};
