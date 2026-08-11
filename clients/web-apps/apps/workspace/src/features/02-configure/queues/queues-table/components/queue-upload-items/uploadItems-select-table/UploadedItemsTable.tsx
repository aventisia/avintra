/* eslint-disable @typescript-eslint/no-explicit-any */
import { Checkbox } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { DTColumnHeader, DataTableSkeleton } from "@avplatform/ui/data-table";
import { Tooltip } from "@avplatform/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { CircleCheckIcon, CircleXIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { InputSchemaField, QueuesTableDto } from "../../../dtos/queues-table-dto";
import { useTableTab } from "../../../hooks/useTableTab";
import { useQueueUploadItemsStore } from "../../../stores/queues-upload-item-store";
import UploadedItemsDT from "./UploadedItemsDT";

export function UploadedItemsTable({
  uploadedData,
  setUploadedData,
}: {
  uploadedData: any[];
  setUploadedData: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const { isProcessiong, rowId } = useQueueUploadItemsStore(
    useShallow((state) => ({
      isProcessiong: state.isProcessing,
      rowId: state.rowId,
      uploadedItems: state.uploadedItems,
      setUploadedItems: state.setUploadedItems,
    })),
  );

  const queryClient = useQueryClient();

  const [colData, setColData] = useState<InputSchemaField[]>([]);

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  useEffect(() => {
    // Get queues data from query client
    const queuesData = queryClient.getQueryData<{
      data: QueuesTableDto[];
    }>(queryKey);

    // Get queue data by id
    const queueData = queuesData?.data.find((item) => item.id === rowId);
    if (queueData?.inputSchema) setColData(queueData?.inputSchema);
  }, [queryClient, queryKey, rowId]);

  const columns = useMemo(() => {
    // Derive columns from the uploaded data keys so that CSV/Excel headers that
    // don't match the queue schema still display. Schema columns come first.
    const dataKeys = (uploadedData?.[0] ? Object.keys(uploadedData[0]) : []).filter(
      (k) => k !== "Status" && k !== "Remark",
    );

    const schemaKeys = colData.map((f) => f.name);
    const extraKeys = dataKeys.filter((k) => !schemaKeys.includes(k));

    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "rowId",
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
      },
      ...generateDTColumns(colData),
      ...extraKeys.map((key) => ({
        accessorKey: key,
        header: ({ column }: any) => (
          <DTColumnHeader
            tableKey={"uploaded-items-table"}
            column={column}
            title={key.charAt(0).toUpperCase() + key.slice(1)}
          />
        ),
        cell: (info: any) => (
          <div className="w-auto truncate font-medium">{String(info.getValue() ?? "")}</div>
        ),
      })),
    ];

    // Only add status column if the first row contains it
    if (uploadedData?.length > 0 && "Status" in uploadedData[0]) {
      baseColumns.push({
        id: "status",
        header: ({ column }) => (
          <DTColumnHeader tableKey={"uploaded-items-table"} column={column} title={"Status"} />
        ),
        cell: ({ row }) => {
          const status = row.original as any;
          const t = status?.Status;
          const r = status?.Remark;

          if (t === "Failed") {
            return (
              <Tooltip content={r}>
                <CircleXIcon className="h-4 w-4 text-red-500" />
              </Tooltip>
            );
          }

          if (t === "Success") {
            return <CircleCheckIcon className="h-4 w-4 text-green-500" />;
          }

          return <div className="text-sm text-muted-foreground">Pending</div>;
        },
      });
    }

    baseColumns.push({
      id: "actions",
      cell: ({ row }) => (
        <Button
          type="button"
          onClick={() => {
            const rowData = row.original;
            setUploadedData((prev) =>
              prev?.filter((r) => JSON.stringify(r) !== JSON.stringify(rowData)),
            );
          }}
          variant={"caution"}
          size={"xs"}
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      ),
    });

    return baseColumns;
  }, [colData, uploadedData, setUploadedData]);

  function generateDTColumns<TData>(fields: InputSchemaField[]): ColumnDef<TData>[] {
    return fields.map((field) => ({
      accessorKey: field.name as keyof TData,
      header: ({ column }) => (
        <DTColumnHeader
          tableKey={"uploaded-items-table"}
          column={column}
          title={field.name.charAt(0).toUpperCase() + field.name.slice(1)}
        />
      ),
      cell: (info) => <div className="w-auto truncate font-medium">{String(info.getValue())}</div>,
    }));
  }
  //  columns visibility
  const columnVisibility = useMemo(() => {
    const dataKeys = (uploadedData?.[0] ? Object.keys(uploadedData[0]) : []).filter(
      (k) => k !== "Status" && k !== "Remark",
    );

    return {
      rowId: false,

      ...generateColumnVisibilityState(colData),
      ...Object.fromEntries(dataKeys.map((k) => [k, true])),
      Status: Object.keys(uploadedData[0] || [])?.includes("Status") ? true : false,
    };
  }, [colData, uploadedData]);

  /** Generate column visibility state with all fields visible */
  function generateColumnVisibilityState(fields: InputSchemaField[]): Record<string, boolean> {
    const visibilityState: Record<string, boolean> = {};

    fields.forEach((field) => {
      visibilityState[field.name] = true;
    });

    return visibilityState;
  }

  return isProcessiong ? (
    <DataTableSkeleton />
  ) : (
    <>
      <UploadedItemsDT
        columns={columns}
        columnsVisibilityState={columnVisibility}
        data={uploadedData || []}
      />
    </>
  );
}
