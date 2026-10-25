import { type TableCNFilterVariant, type TableCNRangeValue } from "../types/table-cn.type";
import { formatCalendarDate, parseCalendarDate, toTime } from "./table-cn-date.util";

const isBlank = (value: unknown) => value === undefined || value === null || value === "";

/**
 * Whether a column filter value matches every row, so the filter can be dropped.
 */
export const isEmptyFilterValue = (value: unknown) =>
  Array.isArray(value) ? value.every(isBlank) : isBlank(value);

/**
 * Splits a comma-separated list; items wrapped in double quotes may contain commas and `""`.
 */
export const splitListValue = (rawValue: string) => {
  const items: string[] = [];
  let item = "";
  let isQuoted = false;
  let wasQuoted = false;

  for (let index = 0; index < rawValue.length; index++) {
    const char = rawValue[index];

    if (char === '"') {
      if (isQuoted && rawValue[index + 1] === '"') {
        item += char;
        index++;
      } else {
        isQuoted = !isQuoted;
        wasQuoted = true;
      }
    } else if (char === "," && !isQuoted) {
      items.push(wasQuoted ? item : item.trim());
      item = "";
      wasQuoted = false;
    } else {
      item += char;
    }
  }

  if (rawValue !== "") items.push(wasQuoted ? item : item.trim());
  return items;
};

/**
 * Joins values into a comma-separated list that {@link splitListValue} reads back unchanged.
 */
export const joinListValue = (values: string[]) =>
  values
    .map((value) =>
      /[,"]/.test(value) || value !== value.trim() ? `"${value.replaceAll('"', '""')}"` : value,
    )
    .join(",");

const parseOptionalNumber = (text: string): number | null | undefined => {
  if (text.trim() === "") return undefined;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
};

const toOptionalNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") return parseOptionalNumber(value) ?? undefined;
  return undefined;
};

/**
 * Reads a `dateRange` filter value as its two optional bounds.
 */
export const toRangeValue = (value: unknown): TableCNRangeValue => {
  if (!Array.isArray(value)) return [undefined, undefined];
  return [toOptionalNumber(value[0]), toOptionalNumber(value[1])];
};

/**
 * Reads a `select` or `multiSelect` filter value as its selected option values.
 */
export const toSelectedValues = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  return typeof value === "string" && value !== "" ? [value] : [];
};

const parseDateRangeParam = (param: string): TableCNRangeValue | undefined => {
  const [from, to] = splitListValue(param).map(parseCalendarDate);
  return from === undefined && to === undefined ? undefined : [from, to];
};

/**
 * Converts a URL parameter into the column filter value used by the toolbar filters.
 */
export const parseFilterParam = (variant: TableCNFilterVariant, param: string): unknown => {
  switch (variant) {
    case "text":
      return param.trim() === "" ? undefined : param;
    case "number":
      return parseOptionalNumber(param) == null ? undefined : param;
    case "date":
      return parseCalendarDate(param);
    case "dateRange":
      return parseDateRangeParam(param);
    case "select":
    case "multiSelect": {
      const values = splitListValue(param).filter((value) => value !== "");
      return values.length > 0 ? values : undefined;
    }
  }
};

const formatOptionalDate = (time: number | undefined) =>
  time === undefined ? "" : formatCalendarDate(time);

/**
 * Converts a column filter value into its URL parameter, or `undefined` when the filter is empty.
 */
export const serializeFilterValue = (
  variant: TableCNFilterVariant,
  value: unknown,
): string | undefined => {
  if (isEmptyFilterValue(value)) return undefined;

  switch (variant) {
    case "text":
    case "number":
      return String(value);
    case "date": {
      const time = toTime(value);
      return time === undefined ? undefined : formatCalendarDate(time);
    }
    case "dateRange": {
      const [from, to] = toRangeValue(value);
      return joinListValue([formatOptionalDate(from), formatOptionalDate(to)]);
    }
    case "select":
    case "multiSelect": {
      const values = toSelectedValues(value);
      return values.length > 0 ? joinListValue(values) : undefined;
    }
  }
};
