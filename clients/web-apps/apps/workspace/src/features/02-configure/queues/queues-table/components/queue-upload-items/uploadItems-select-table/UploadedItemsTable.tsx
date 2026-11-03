/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TABLE_CN_ACTIONS_COLUMN_ID,
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
  TableCNColumnHeader,
  TableCNSkeleton,
  getTableCNSelectColumn,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { Tooltip } from "@avplatform/ui/tooltip";
import { CheckCircleIcon, TrashIcon, XCircleIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef, InitialTableState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getMergedQueryData } from "@/utils/get-merged-query-data.util";
import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { InputSchemaField, QueuesTableDto } from "../../../dtos/queues-table-dto";
import { useTableTab } from "../../../hooks/useTableTab";
import { useQueueUploadItemsStore } from "../../../stores/queues-upload-item-store";
import UploadedItemsDT from "./UploadedItemsDT";

// The dialog keeps its own page/sort parameters so it cannot disturb the queues page.
const UPLOADED_ITEMS_QUERY_KEYS = {
  page: "uploadItemsPage",
  perPage: "uploadItemsPerPage",
  sort: "uploadItemsSort",
};

const UPLOADED_ITEMS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

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
    // Get queues data from the merged Personal/Shared lists in the cache
    const queuesData = getMergedQueryData<QueuesTableDto>(queryClient, queryKey);

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
      getTableCNSelectColumn<any>(),
      ...generateDTColumns(colData),
      ...extraKeys.map((key) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return {
          accessorKey: key,
          meta: { label },
          header: ({ column }: any) => <TableCNColumnHeader column={column} label={label} />,
          cell: (info: any) => (
            <div className="w-auto truncate font-medium">{String(info.getValue() ?? "")}</div>
          ),
        };
      }),
    ];

    // Only add status column if the first row contains it
    if (uploadedData?.length > 0 && "Status" in uploadedData[0]) {
      baseColumns.push({
        id: "status",
        meta: { label: "Status" },
        header: ({ column }) => <TableCNColumnHeader column={column} label="Status" />,
        cell: ({ row }) => {
          const status = row.original as any;
          const t = status?.Status;
          const r = status?.Remark;

          if (t === "Failed") {
            return (
              <Tooltip content={r}>
                <XCircleIcon className="h-4 w-4 text-bad" />
              </Tooltip>
            );
          }

          if (t === "Success") {
            return <CheckCircleIcon className="h-4 w-4 text-ok" />;
          }

          return <div className="text-sm text-muted-foreground">Pending</div>;
        },
      });
    }

    baseColumns.push(
      getRowActionsColumn<any>({
        actions: ({ row }) => (
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
            <TrashIcon className="h-4 w-4" />
          </Button>
        ),
      }),
    );

    return baseColumns;
  }, [colData, uploadedData, setUploadedData]);

  function generateDTColumns<TData>(fields: InputSchemaField[]): ColumnDef<TData>[] {
    return fields.map((field) => {
      const label = field.name.charAt(0).toUpperCase() + field.name.slice(1);
      return {
        accessorKey: field.name as keyof TData,
        meta: { label },
        header: ({ column }) => <TableCNColumnHeader column={column} label={label} />,
        cell: (info) => (
          <div className="w-auto truncate font-medium">{String(info.getValue())}</div>
        ),
      };
    });
  }

  // Create a TableCN table; page, size, and sorting live in the dialog's own URL keys
  const { table } = useTableCN({
    data: uploadedData ?? [],
    columns,
    getRowId: (_row, index) => String(index),
    initialState: UPLOADED_ITEMS_INITIAL_STATE,
    queryKeys: UPLOADED_ITEMS_QUERY_KEYS,
    persistKey: "uploaded-items",
  });

  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Remove the selected rows from the upload list
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const removeSelectedRows = () => {
    const selected = new Set(selectedRows.map((row) => JSON.stringify(row.original)));
    setUploadedData((prev) => prev?.filter((item) => !selected.has(JSON.stringify(item))));
    table.toggleAllRowsSelected(false);
  };

  return isProcessiong ? (
    <TableCNSkeleton columnCount={Math.max(columns.length, 1)} />
  ) : (
    <UploadedItemsDT
      table={table}
      actionBar={
        <TableCNActionBar table={table}>
          <TableCNActionBarSelection table={table} />
          <TableCNActionBarSeparator />
          <TableCNActionBarItem
            icon={TrashIcon}
            tone="destructive"
            onClick={() =>
              showDefaultAlertDialog({
                confirmActionFn: removeSelectedRows,
                alertType: "delete-multiple",
                additionalText: `${selectedRows.length} ${selectedRows.length > 1 ? "items" : "item"}`,
              })
            }
          >
            Remove
          </TableCNActionBarItem>
        </TableCNActionBar>
      }
    />
  );
}
