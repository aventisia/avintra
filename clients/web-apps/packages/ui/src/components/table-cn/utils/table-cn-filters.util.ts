import { type ColumnDef, type FilterFn } from "@tanstack/react-table";

import { type TableCNFilterVariant } from "../types/table-cn.type";
import { endOfDay, startOfDay, toTime } from "./table-cn-date.util";
import { isEmptyFilterValue, toRangeValue, toSelectedValues } from "./table-cn-filter-value.util";

const toText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

const toNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return Number.NaN;
  return typeof value === "number" ? value : Number(value);
};

const isWithinBounds = (value: number, [min, max]: [number, number]) =>
  value >= min && value <= max;

const matchesText = (cellValue: unknown, filterValue: unknown) =>
  toText(cellValue).toLowerCase().includes(toText(filterValue).trim().toLowerCase());

const matchesNumber = (cellValue: unknown, filterValue: unknown) => {
  const cellNumber = toNumber(cellValue);
  return !Number.isNaN(cellNumber) && cellNumber === toNumber(filterValue);
};

const matchesDate = (cellValue: unknown, filterValue: unknown) => {
  const cellTime = toTime(cellValue);
  const filterTime = toTime(filterValue);
  if (cellTime === undefined || filterTime === undefined) return false;

  return isWithinBounds(cellTime, [startOfDay(filterTime), endOfDay(filterTime)]);
};

const matchesDateRange = (cellValue: unknown, filterValue: unknown) => {
  const cellTime = toTime(cellValue);
  if (cellTime === undefined) return false;

  const [from, to] = toRangeValue(filterValue);
  return isWithinBounds(cellTime, [
    from === undefined ? -Infinity : startOfDay(from),
    to === undefined ? Infinity : endOfDay(to),
  ]);
};

const matchesSelection = (cellValue: unknown, filterValue: unknown) => {
  const selectedValues = toSelectedValues(filterValue);
  const cellValues = Array.isArray(cellValue) ? cellValue.map(toText) : [toText(cellValue)];
  return cellValues.some((value) => selectedValues.includes(value));
};

const FILTER_MATCHERS: Record<
  TableCNFilterVariant,
  (cellValue: unknown, filterValue: unknown) => boolean
> = {
  text: matchesText,
  number: matchesNumber,
  date: matchesDate,
  dateRange: matchesDateRange,
  select: matchesSelection,
  multiSelect: matchesSelection,
};

/**
 * Whether a cell value passes a toolbar filter of the given variant.
 */
export const matchesFilterValue = (
  variant: TableCNFilterVariant,
  cellValue: unknown,
  filterValue: unknown,
) => isEmptyFilterValue(filterValue) || FILTER_MATCHERS[variant](cellValue, filterValue);

/**
 * Client-side filter function for a column filter variant.
 */
export const getTableCNFilterFn = <TData>(variant: TableCNFilterVariant): FilterFn<TData> => {
  const filterFn: FilterFn<TData> = (row, columnId, filterValue) =>
    matchesFilterValue(variant, row.getValue(columnId), filterValue);
  filterFn.autoRemove = isEmptyFilterValue;
  return filterFn;
};

/**
 * Global search filter: trimmed, case-insensitive "contains" on the searchable columns.
 */
export const getTableCNSearchFilterFn = <TData>(): FilterFn<TData> => {
  const filterFn: FilterFn<TData> = (row, columnId, filterValue) =>
    matchesText(row.getValue(columnId), filterValue);
  filterFn.autoRemove = (value) => toText(value).trim() === "";
  return filterFn;
};

/**
 * Gives every column with a filter `variant` and no own `filterFn` the matching client-side filter.
 */
export const withTableCNFilterFns = <TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
): ColumnDef<TData, TValue>[] =>
  columns.map((column) => {
    const variant = column.meta?.variant;
    const childColumns = "columns" in column ? column.columns : undefined;

    return {
      ...column,
      ...(childColumns && { columns: withTableCNFilterFns(childColumns) }),
      ...(variant &&
        column.filterFn === undefined && { filterFn: getTableCNFilterFn<TData>(variant) }),
    } as ColumnDef<TData, TValue>;
  });
