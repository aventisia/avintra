import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DTBulkActions } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkActions";
import { DTBulkDeleteAction } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkDeleteAction";
import { DTSelectionInfo } from "@/react-toolkit/ui/data-table/bulk-actions/DTSelectionInfo";
import { Separator } from "@/react-toolkit/ui/separator";
import { Table } from "@tanstack/react-table";
import { queueOptimisticMutationFn } from "../apis/queues-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { QueuesTableDto } from "../dtos/queues-table-dto";
import { QueueBulkRetryAction } from "./queue-row-actions/QueueBulkRetryAction";

interface QueueBulkActionsProps {
  table: Table<QueuesTableDto>;
}

export function QueueBulkActions({ table }: Readonly<QueueBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds =
    table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id)
      .filter((id): id is string => id !== undefined) || true;

  const failedCount = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.failedCount)
    .some((id): id is number => id !== 0);

  // Get mutation function to delete the queue
  const { mutate: deletequeues } = useListOptimisticMutation<
    string[],
    QueuesTableDto | boolean,
    QueuesTableDto
  >(selectedRowIds, queueOptimisticMutationFn, DATA_QUERY_KEY);

  // TODO: Rollback selection if there is an error

  return (
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
            onClick={() => {
              // Show alert dialog to confirm delete
              showDefaultAlertDialog({
                confirmActionFn: () => {
                  // Delete selected queues
                  deletequeues({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "queues" : "queue"}`,
              });
            }}
          />
          {failedCount && (
            <>
              <Separator orientation="vertical" className="h-6 w-[0.5px]" />
              <QueueBulkRetryAction />
            </>
          )}
        </DTBulkActions>
      )}
    </>
  );
}
