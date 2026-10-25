import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnSort,
  PaginationState,
  SortingState,
  Updater,
  VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import {
  applyPaginationChange,
  clampPageIndex,
  resetPageIndex,
  resolveUpdater,
} from "./data-table-state.util";

const DEFAULT_PAGE_SIZE = 50;

export interface UseDataTableOptions<TData> {
  /** Stable row identity; defaults to the row index. */
  getRowId?: (row: TData) => string;

  /**
   * Keeps the current page when the data changes, clamps it to the last page, and returns to
   * page 1 only when the search text or the page size changes.
   */
  keepPageOnDataChange?: boolean;

  /** Controlled search text. */
  globalFilter?: string;
  onGlobalFilterChange?: (globalFilter: string) => void;
}

export const useDataTable = <TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
  data: TData[],

  /** Columns initial visibility state when table loads for the first time */
  columnsVisibilityState: VisibilityState,

  /** Columns initial sorting state when table loads for the first time */
  sortingState?: ColumnSort[],

  enableRowSelection?: boolean,
  manualPagination?: boolean,
  options?: UseDataTableOptions<TData>,
) => {
  const {
    getRowId,
    keepPageOnDataChange = false,
    globalFilter: controlledGlobalFilter,
    onGlobalFilterChange,
  } = options ?? {};

  // Initialize the row selection state.
  const [rowSelection, setRowSelection] = React.useState({});

  // Initialize the column visibility state.
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(columnsVisibilityState);

  // Initialize the column filters state.
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Initialize the sorting state.
  const [sorting, setSorting] = React.useState<SortingState>(sortingState || []);

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("");

  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter;
  const ownsGlobalFilter = keepPageOnDataChange || onGlobalFilterChange !== undefined;

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    setPagination((previous) => applyPaginationChange(previous, resolveUpdater(updater, previous)));
  };

  const handleGlobalFilterChange = (updater: Updater<string>) => {
    const next = resolveUpdater(updater, globalFilter);
    setInternalGlobalFilter(next);
    onGlobalFilterChange?.(next);
    if (keepPageOnDataChange) {
      setPagination(resetPageIndex);
    }
  };

  // Create a new instance of the React table.
  const table = useReactTable({
    data: data,
    columns,
    initialState: {
      pagination: {
        pageSize: DEFAULT_PAGE_SIZE,
      },
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      ...(keepPageOnDataChange && { pagination }),
      ...(ownsGlobalFilter && { globalFilter }),
    },
    enableRowSelection: enableRowSelection,
    manualPagination: manualPagination,
    ...(getRowId && { getRowId }),
    ...(keepPageOnDataChange && {
      autoResetPageIndex: false,
      onPaginationChange: handlePaginationChange,
    }),
    ...(ownsGlobalFilter && { onGlobalFilterChange: handleGlobalFilterChange }),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const pageCount = table.getPageCount();

  React.useEffect(() => {
    if (keepPageOnDataChange) {
      setPagination((previous) => clampPageIndex(previous, pageCount));
    }
  }, [keepPageOnDataChange, pageCount]);

  // Return the table instance.
  return table;
};
