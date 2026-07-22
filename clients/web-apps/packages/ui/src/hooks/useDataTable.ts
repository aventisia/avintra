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
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

export const useDataTable = <TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
  data: TData[],

  /** Columns initial visibility state when table loads for the first time */
  columnsVisibilityState: VisibilityState,

  /** Columns initial sorting state when table loads for the first time */
  sortingState?: ColumnSort[],

  enableRowSelection?: boolean,
  manualPagination?: boolean,
) => {
  // Initialize the row selection state.
  const [rowSelection, setRowSelection] = React.useState({});

  // Initialize the column visibility state.
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(columnsVisibilityState);

  // Initialize the column filters state.
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Initialize the sorting state.
  const [sorting, setSorting] = React.useState<SortingState>(sortingState || []);

  // Create a new instance of the React table.
  const table = useReactTable({
    data: data,
    columns,
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: enableRowSelection,
    manualPagination: manualPagination,
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

  // Return the table instance.
  return table;
};
