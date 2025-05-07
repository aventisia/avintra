import { Checkbox } from "@aventisia/ui";
import {
  DataTable,
  DataTableSkeleton,
  DTColumnHeader,
  DTSearchBox,
} from "@aventisia/ui/data-table";
import { ScrollArea } from "@aventisia/ui/scroll";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Enumerable from "linq";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useQueueUploadItemsStore } from "../../../stores/queues-upload-item-store";

import { UploadedItemsTablePagination } from "./UploadedItemsTablePagination";

type UploadedItemsTableProps<TData extends object> = {
  isRowSelectionEnabled?: boolean;
  data: TData[];
};

export function UploadedItemsTable<TData extends object>({
  data,
}: Readonly<UploadedItemsTableProps<TData>>) {
  const { isProcessiong } = useQueueUploadItemsStore(
    useShallow((state) => ({
      isProcessiong: state.isProcessing,
    })),
  );

  // create dynamic columns
  const columns: ColumnDef<TData>[] = useMemo(() => {
    const sampleObject = data[0];
    if (!sampleObject) return [{ id: "id" }];
    const columns = Enumerable.from(Object.keys(sampleObject)).select<
      ColumnDef<TData>
    >((key) => ({
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

  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return isProcessiong ? (
    <DataTableSkeleton />
  ) : (
    <>
      <div className="my-2 flex items-center justify-between">
        <h4 className="text-md ml-1 flex w-full items-center truncate text-foreground">
          Data
        </h4>

        <div className="flex items-center gap-2">
          <DTSearchBox
            table={table}
            searchColumn={table.getAllColumns()[0].id}
            placeholder="Search data..."
          />
        </div>
      </div>

      {/* Data table to render data */}
      <ScrollArea className="h-[calc(60vh-15rem)] w-[48vw]">
        <DataTable table={table} columnsLength={columns.length} />
      </ScrollArea>
      <div className="mt-2">
        <UploadedItemsTablePagination table={table} />
      </div>
    </>
  );
}
