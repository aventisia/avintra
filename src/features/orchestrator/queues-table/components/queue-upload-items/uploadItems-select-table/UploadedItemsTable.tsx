import { DataTable } from "@/react-toolkit/ui/data-table";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useQueueUploadItemsStore } from "../../../stores/queues-upload-item-store";
import { useShallow } from "zustand/react/shallow";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
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
  const columns: ColumnDef<TData>[] = useMemo(() => {
    const sampleObject = data[0];
    return Object.keys(sampleObject).map((key) => ({
      accessorKey: key as keyof TData,
      header: () => key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the key name
      cell: (info) => String(info.getValue()), // Convert all values to strings for display
    }));
  }, [data]);

  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
            searchColumn="name"
            placeholder="Search machines..."
          />
        </div>
      </div>

      {/* Data table to render data */}
      <div className="rounded-md border">
        <ScrollArea className="h-[calc(60vh-15rem)] w-[48vw]">
          <DataTable table={table} columnsLength={columns.length} />
        </ScrollArea>
      </div>
      <div className="mt-2">
        <UploadedItemsTablePagination table={table} />
      </div>
    </>
  );
}
