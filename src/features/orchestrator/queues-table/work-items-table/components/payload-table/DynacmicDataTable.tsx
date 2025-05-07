import { Checkbox } from "@aventisia/ui";
import {
  DataTable,
  DataTableSkeleton,
  DTColumnHeader,
  DTPagination,
  DTViewOptions,
} from "@aventisia/ui/data-table";
import { KeyValueLookupType } from "@aventisia/ui/types";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Enumerable from "linq";
import { useMemo, useState } from "react";

import { PayloadTableBulkActions } from "./PayloadTableBulkActions";
import { SearchDataTable } from "./SearchDataTable";

export function DynacmicDataTable<TData extends object>({
  isLoading,
  data,
}: {
  isLoading: boolean;
  data: TData[];
}) {
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
        value: k.charAt(0).toUpperCase() + k.slice(1),
      }))
      .toArray();

    setColumnsVisibilityState(Object.assign({}, ...visibilityStateColumns));
    setColumnDisplayNames(displayNamesStateColumns);

    const columns = keys.select<ColumnDef<TData>>((key) => ({
      accessorKey: key as keyof TData,
      header: ({ column }) => (
        <DTColumnHeader
          column={column}
          title={key.charAt(0).toUpperCase() + key.slice(1)}
        />
      ), // Capitalize the key name
      cell: (info) => (
        <div className="w-auto truncate font-medium">
          {String(info.getValue())}
        </div>
      ),
    }));

    const selectRowsColumn: ColumnDef<TData> = {
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

    return [selectRowsColumn, ...columns];
  }, [data]);

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
        <div className="me-5 flex items-center gap-2">
          <DTViewOptions {...{ table, columnDisplayNames }} />

          <SearchDataTable
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
      </div>

      {/* Data table to render data */}
      <div className="rounded-lg border">
        <DataTable table={table} columnsLength={columns.length} />
      </div>
      <div className="mt-2">
        {/* Data table Pagination component */}
        <DTPagination table={table} />

        {/* Data table bulk action component */}
        <PayloadTableBulkActions table={table} />
      </div>
    </>
  );
}
