import { type SortingState, type VisibilityState } from "@tanstack/react-table";

import { TABLE_CN_STORAGE_KEY_PREFIX } from "../constants/table-cn.constant";

export type TableCNStoredState = {
  columnVisibility?: VisibilityState;
  sorting?: SortingState;
};

const isVisibilityState = (value: unknown): value is VisibilityState =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((visible) => typeof visible === "boolean");

const parseStoredState = (raw: string | null): TableCNStoredState => {
  const parsed: unknown = raw ? JSON.parse(raw) : undefined;
  if (typeof parsed !== "object" || parsed === null) return {};

  const { columnVisibility, sorting } = parsed as Record<string, unknown>;
  return {
    columnVisibility: isVisibilityState(columnVisibility) ? columnVisibility : undefined,
    sorting: Array.isArray(sorting) ? (sorting as SortingState) : undefined,
  };
};

/**
 * Reads the column visibility and sorting saved for a table in this browser.
 * Sorting is unvalidated here; check it against the table's columns before use.
 */
export const readTableCNStoredState = (persistKey: string): TableCNStoredState => {
  try {
    return parseStoredState(localStorage.getItem(TABLE_CN_STORAGE_KEY_PREFIX + persistKey));
  } catch {
    return {};
  }
};

/**
 * Saves part of a table's column visibility and sorting for this browser.
 */
export const writeTableCNStoredState = (persistKey: string, update: TableCNStoredState) => {
  try {
    const nextState = { ...readTableCNStoredState(persistKey), ...update };
    localStorage.setItem(TABLE_CN_STORAGE_KEY_PREFIX + persistKey, JSON.stringify(nextState));
  } catch {
    return;
  }
};
