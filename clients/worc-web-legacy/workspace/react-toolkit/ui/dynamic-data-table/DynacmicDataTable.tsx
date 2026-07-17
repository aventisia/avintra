import { Checkbox } from "@aventisia/ui";
import {
  DTColumnHeader,
  DTPagination,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
} from "@aventisia/ui/data-table";
import { KeyValueLookupType } from "@aventisia/ui/types";
import { formatDate } from "@aventisia/ui/utils";
import {
  ColumnDef,
  Table,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { isDate } from "date-fns";
import Enumerable from "linq";
import { useMemo, useState } from "react";

import { SearchDataTable } from "./SearchDataTable";
import { ColumnHeaderMap, TABLE_KEY } from "./constants";

export type DynacmicDataTableProps<TData> = {
  TableHeading: () => React.ReactNode;
  formatDates: boolean;
  isLoading: boolean;
  enableRowSelection: boolean;
  PaginationElement?: React.ReactNode;
  columsHeaderMap?: ColumnHeaderMap<TData>;
  BulkActionElement?: (table: Table<TData>) => React.ReactNode;
  data: TData[];
};

export function DynacmicDataTable<TData extends object>({
  isLoading,
  formatDates,
  TableHeading,
  enableRowSelection,
  columsHeaderMap,
  data,
  PaginationElement,
  BulkActionElement,
}: DynacmicDataTableProps<TData>) {
  const [columnsVisibilityState, setColumnsVisibilityState] = useState<
    Record<string, boolean>
  >({});

  const [columnDisplayNames, setColumnDisplayNames] = useState<
    KeyValueLookupType[]
  >([]);

  // create dynamic columns
  const columns: ColumnDef<TData>[] = useMemo(() => {
    const sampleObject = data[0];
    if (!sampleObject) return [{ id: "id" }];

    const keys = Enumerable.from(Object.keys(sampleObject));

    const visibilityStateColumns = keys
      .select<Record<string, boolean>>((k, i) => ({ [k]: i <= 6 }))
      .toArray();

    const displayNamesStateColumns = keys
      .select<KeyValueLookupType>((k) => ({
        key: k,
        value: columsHeaderMap
          ? (columsHeaderMap[k as keyof TData]?.title ??
            k.charAt(0).toUpperCase() + k.slice(1))
          : k.charAt(0).toUpperCase() + k.slice(1),
      }))
      .toArray();

    setColumnsVisibilityState(Object.assign({}, ...visibilityStateColumns));
    setColumnDisplayNames(displayNamesStateColumns);

    const columns = GenerateColumnsForDataTable<TData>(
      sampleObject,
      formatDates,
      columsHeaderMap,
    );

    const selectRowsColumn = RowSelectionColum<TData>();

    return enableRowSelection ? [selectRowsColumn, ...columns] : [...columns];
  }, [columsHeaderMap, data, enableRowSelection, formatDates]);

  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility: columnsVisibilityState,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter, // Update the global filter
    onColumnVisibilityChange: setColumnsVisibilityState,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Enable filtering
  });

  return isLoading ? (
    <DataTableSkeleton />
  ) : (
    <>
      <div className="my-2 flex items-center justify-end">
        {TableHeading?.()}
        <div className="me-5 flex items-center gap-2">
          <DTViewOptions
            {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
          />

          <SearchDataTable
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
      </div>

      {/* Data table to render data */}
      <DataTable table={table} columnsLength={columns.length} />
      <div className="mt-2">
        {/* Data table Pagination component */}
        {PaginationElement ?? <DTPagination table={table} />}
        {/* Data table bulk action component */}
        {BulkActionElement?.(table)}
      </div>
    </>
  );
}

export function GenerateColumnsForDataTable<TData>(
  sampleObject: object,
  formatDates: boolean,
  columsHeaderMap?: ColumnHeaderMap<TData>,
): ColumnDef<TData>[] {
  const keys = Enumerable.from(Object.keys(sampleObject));

  const columns = keys.select<ColumnDef<TData>>((key) => {
    return {
      accessorKey: key as keyof TData,
      header: ({ column }) => (
        <DTColumnHeader
          tableKey={TABLE_KEY}
          column={column}
          title={
            columsHeaderMap
              ? (columsHeaderMap[key as keyof TData]?.title ??
                key.charAt(0).toUpperCase() + key.slice(1))
              : key.charAt(0).toUpperCase() + key.slice(1)
          }
        />
      ), // Capitalize the key name
      cell: (info) => (
        <div className="w-auto truncate font-medium">
          {isDate(info.getValue()) && formatDates
            ? formatDate(info.getValue<Date>())
            : String(info.getValue())}
        </div>
      ),
    };
  });
  return columns.toArray();
}

export function RowSelectionColum<TData>(): ColumnDef<TData> {
  return {
    accessorKey: "id",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
  };
}
