import { type ColumnFiltersState, type ColumnSort, type SortingState } from "@tanstack/react-table";

import { type TableCNFilterVariant } from "../types/table-cn.type";
import {
  isEmptyFilterValue,
  parseFilterParam,
  serializeFilterValue,
} from "./table-cn-filter-value.util";

type FilterVariants = ReadonlyMap<string, TableCNFilterVariant>;

const SORT_DIRECTIONS = ["asc", "desc"];

/**
 * Sets a URL parameter, or removes it when the value is `undefined`.
 */
export const setSearchParam = (params: URLSearchParams, key: string, value: string | undefined) => {
  if (value === undefined) params.delete(key);
  else params.set(key, value);
};

/**
 * Reads a 1-based page or page size parameter; anything but a positive integer is ignored.
 */
export const parsePositiveIntegerParam = (value: string | null) => {
  if (value === null || !/^\d+$/.test(value)) return undefined;
  const number = Number(value);
  return number >= 1 && Number.isSafeInteger(number) ? number : undefined;
};

const isColumnSort = (item: unknown): item is ColumnSort =>
  typeof item === "object" &&
  item !== null &&
  typeof (item as ColumnSort).id === "string" &&
  typeof (item as ColumnSort).desc === "boolean";

/**
 * Whether a value is a valid sorting state whose columns can all be sorted.
 */
export const isKnownSortingState = (
  value: unknown,
  sortableIds: ReadonlySet<string>,
): value is SortingState =>
  Array.isArray(value) &&
  value.every(isColumnSort) &&
  value.every(({ id }) => sortableIds.has(id)) &&
  new Set(value.map(({ id }) => id)).size === value.length;

const parseCompactSorting = (value: string): SortingState | undefined => {
  const sorting: SortingState = [];

  for (const part of value.split(",")) {
    const separatorIndex = part.lastIndexOf(".");
    const direction = part.slice(separatorIndex + 1);
    if (separatorIndex <= 0 || !SORT_DIRECTIONS.includes(direction)) return undefined;

    sorting.push({ id: part.slice(0, separatorIndex), desc: direction === "desc" });
  }

  return sorting;
};

const parseJsonSorting = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

/**
 * Reads `id.asc,id.desc` (or the JSON form used for ids with commas) as a sorting state.
 * Returns `undefined` when the value is malformed or names a column that cannot be sorted.
 */
export const parseSortingParam = (value: string, sortableIds: ReadonlySet<string>) => {
  const sorting = value.startsWith("[") ? parseJsonSorting(value) : parseCompactSorting(value);
  return isKnownSortingState(sorting, sortableIds) && sorting.length > 0 ? sorting : undefined;
};

/**
 * Writes a non-empty sorting state as `id.asc,id.desc`, or as JSON when an id would not round-trip.
 */
export const serializeSorting = (sorting: SortingState) => {
  const compact = sorting.map(({ id, desc }) => `${id}.${desc ? "desc" : "asc"}`).join(",");
  const isCompactSafe = sorting.every(({ id }) => id !== "" && !id.includes(","));

  return isCompactSafe && !compact.startsWith("[")
    ? compact
    : JSON.stringify(sorting.map(({ id, desc }) => ({ id, desc })));
};

/**
 * Whether two sorting states sort the same columns in the same directions and order.
 */
export const isSameSorting = (first: SortingState, second: SortingState) =>
  first.length === second.length &&
  first.every(({ id, desc }, index) => id === second[index].id && desc === second[index].desc);

/**
 * The filter parameters of a URL, sorted, as a stable key for change detection.
 */
export const getFilterParamsKey = (params: URLSearchParams, filterVariants: FilterVariants) => {
  const filterParams = new URLSearchParams();

  for (const id of filterVariants.keys()) {
    const value = params.get(id);
    if (value !== null) filterParams.set(id, value);
  }

  filterParams.sort();
  return filterParams.toString();
};

/**
 * Reads the column filters held in a URL; invalid or empty parameters are skipped.
 */
export const readColumnFilters = (
  params: URLSearchParams,
  filterVariants: FilterVariants,
): ColumnFiltersState =>
  [...filterVariants].flatMap(([id, variant]) => {
    const param = params.get(id);
    const value = param === null ? undefined : parseFilterParam(variant, param);
    return isEmptyFilterValue(value) ? [] : [{ id, value }];
  });

/**
 * Writes column filters into URL parameters and removes the parameters of cleared filters.
 */
export const writeColumnFilters = (
  params: URLSearchParams,
  columnFilters: ColumnFiltersState,
  filterVariants: FilterVariants,
) => {
  for (const [id, variant] of filterVariants) {
    const filter = columnFilters.find((columnFilter) => columnFilter.id === id);
    setSearchParam(params, id, filter && serializeFilterValue(variant, filter.value));
  }
};

/**
 * The key {@link getFilterParamsKey} would return once these column filters are in the URL.
 */
export const getColumnFiltersKey = (
  columnFilters: ColumnFiltersState,
  filterVariants: FilterVariants,
) => {
  const params = new URLSearchParams();
  writeColumnFilters(params, columnFilters, filterVariants);
  return getFilterParamsKey(params, filterVariants);
};
