import {
  type InitialTableState,
  type TableOptions,
  type VisibilityState,
  functionalUpdate,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  TABLE_CN_DEFAULT_PAGE_SIZE,
  TABLE_CN_DEFAULT_QUERY_KEYS,
  TABLE_CN_FILTER_DEBOUNCE_MS,
} from "../constants/table-cn.constant";
import { type TableCNHistoryMode, type TableCNQueryKeys } from "../types/table-cn.type";
import {
  type TableCNColumnIndex,
  getTableCNColumnIndex,
  withoutHiddenAlwaysVisibleColumns,
} from "../utils/table-cn-column-index.util";
import { getTableCNSearchFilterFn, withTableCNFilterFns } from "../utils/table-cn-filters.util";
import { readTableCNStoredState, writeTableCNStoredState } from "../utils/table-cn-storage.util";
import { isKnownSortingState } from "../utils/table-cn-url.util";
import { useTableCNUrlState } from "./useTableCNUrlState.hook";

type TableCNOwnedOption =
  | "state"
  | "pageCount"
  | "getCoreRowModel"
  | "manualPagination"
  | "manualSorting"
  | "manualFiltering"
  | "autoResetPageIndex"
  | "onPaginationChange"
  | "onSortingChange"
  | "onColumnFiltersChange"
  | "onColumnVisibilityChange"
  | "onGlobalFilterChange";

export type UseTableCNOptions<TData> = Omit<TableOptions<TData>, TableCNOwnedOption> & {
  /** URL parameter names; rename them when two tables share one page. */
  queryKeys?: Partial<TableCNQueryKeys>;
  /** Whether state changes add browser history entries. Defaults to `"replace"`. */
  history?: TableCNHistoryMode;
  /** Delay before filter edits are written to the URL. */
  debounceMs?: number;
  /** Saves column visibility and sorting in this browser under this key. */
  persistKey?: string;
  /** Column ids the global search matches; defaults to every text and number column. */
  searchColumns?: string[];
  /** Controlled global search text. */
  globalFilter?: string;
  onGlobalFilterChange?: (globalFilter: string) => void;
};

type TableCNDefaultsOptions = {
  persistKey?: string;
  initialState?: InitialTableState;
  columnIndex: TableCNColumnIndex;
};

const getTableCNDefaults = ({ persistKey, initialState, columnIndex }: TableCNDefaultsOptions) => {
  const storedState = persistKey ? readTableCNStoredState(persistKey) : {};

  return {
    pageSize: initialState?.pagination?.pageSize ?? TABLE_CN_DEFAULT_PAGE_SIZE,
    sorting: isKnownSortingState(storedState.sorting, columnIndex.sortableIds)
      ? storedState.sorting
      : (initialState?.sorting ?? []),
    columnVisibility: {
      ...initialState?.columnVisibility,
      ...withoutHiddenAlwaysVisibleColumns(
        storedState.columnVisibility ?? {},
        columnIndex.alwaysVisibleIds,
      ),
    } as VisibilityState,
  };
};

/**
 * Creates a TableCN table whose page, page size, sorting, and column filters live in the URL.
 * The page is kept when data changes (clamped to the last page) and returns to the first page
 * when the search text, a column filter, or the page size changes. Requires a react-router context.
 */
export const useTableCN = <TData>({
  columns,
  initialState,
  queryKeys,
  history = "replace",
  debounceMs = TABLE_CN_FILTER_DEBOUNCE_MS,
  persistKey,
  searchColumns,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,
  ...tableOptions
}: UseTableCNOptions<TData>) => {
  const {
    page: pageKey,
    perPage: perPageKey,
    sort: sortKey,
  } = { ...TABLE_CN_DEFAULT_QUERY_KEYS, ...queryKeys };
  const resolvedQueryKeys = useMemo(
    () => ({ page: pageKey, perPage: perPageKey, sort: sortKey }),
    [pageKey, perPageKey, sortKey],
  );

  const tableColumns = useMemo(() => withTableCNFilterFns(columns), [columns]);
  const columnIndex = useMemo(() => getTableCNColumnIndex(columns), [columns]);

  const [defaults] = useState(() => getTableCNDefaults({ persistKey, initialState, columnIndex }));

  const urlState = useTableCNUrlState({
    queryKeys: resolvedQueryKeys,
    columnIndex,
    defaultPageSize: defaults.pageSize,
    defaultSorting: defaults.sorting,
    initialColumnFilters: initialState?.columnFilters,
    history,
    debounceMs,
  });

  const [columnVisibility, setColumnVisibility] = useState(defaults.columnVisibility);
  const [uncontrolledGlobalFilter, setUncontrolledGlobalFilter] = useState("");
  const globalFilter = controlledGlobalFilter ?? uncontrolledGlobalFilter;

  const searchTerm = globalFilter.trim();
  const pageResetSearchTermRef = useRef(searchTerm);
  const isPageResetPending =
    pageResetSearchTermRef.current !== searchTerm || urlState.hasPendingFilterWrite;
  const pagination = isPageResetPending
    ? { ...urlState.pagination, pageIndex: 0 }
    : urlState.pagination;

  const searchFilterFn = useMemo(() => getTableCNSearchFilterFn<TData>(), []);

  const table = useReactTable<TData>({
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    ...(searchColumns && {
      globalFilterFn: searchFilterFn,
      getColumnCanGlobalFilter: (column) => searchColumns.includes(column.id),
    }),
    ...tableOptions,
    columns: tableColumns,
    initialState,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
      sorting: urlState.sorting,
      columnFilters: urlState.columnFilters,
      columnVisibility,
      globalFilter,
    },
    onPaginationChange: (updater) => urlState.setPagination(functionalUpdate(updater, pagination)),
    onSortingChange: (updater) => {
      const nextSorting = functionalUpdate(updater, urlState.sorting);
      urlState.setSorting(nextSorting);
      if (persistKey) writeTableCNStoredState(persistKey, { sorting: nextSorting });
    },
    onColumnFiltersChange: (updater) =>
      urlState.setColumnFilters(functionalUpdate(updater, urlState.columnFilters)),
    onColumnVisibilityChange: (updater) => {
      const nextVisibility = functionalUpdate(updater, columnVisibility);
      setColumnVisibility(nextVisibility);
      if (persistKey) writeTableCNStoredState(persistKey, { columnVisibility: nextVisibility });
    },
    onGlobalFilterChange: (updater) => {
      const nextGlobalFilter = String(functionalUpdate(updater, globalFilter) ?? "");
      setUncontrolledGlobalFilter(nextGlobalFilter);
      onGlobalFilterChange?.(nextGlobalFilter);
    },
  });

  const resolvedPageCount = table.getPageCount();
  const { hasPendingFilterWrite, resetPageIndex, clampPageIndex } = urlState;

  useEffect(() => {
    if (pageResetSearchTermRef.current !== searchTerm) {
      pageResetSearchTermRef.current = searchTerm;
      resetPageIndex();
      return;
    }

    if (!hasPendingFilterWrite) clampPageIndex(resolvedPageCount);
  }, [clampPageIndex, hasPendingFilterWrite, resetPageIndex, resolvedPageCount, searchTerm]);

  return { table };
};
