import { Separator } from "@aventisia/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@aventisia/ui/data-table";
import { useListOptimisticMutation, useShowAlertHandler } from "@aventisia/ui/hooks";
import { Table } from "@tanstack/react-table";

import { workItemsOptimisticMutationFn } from "../../apis/work-items-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { QueueWorkItemDto } from "../../dtos/queue-work-item-dto";

interface WorkItemsTableBulkActionsProps {
  table: Table<QueueWorkItemDto>;
}

export function WorkItemsTableBulkActions({
  table,
}: Readonly<WorkItemsTableBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds =
    table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id)
      .filter((id): id is string => id !== undefined) || true;

  // Get mutation function to delete the queue
  const { mutate: deletequeues } = useListOptimisticMutation<
    string[],
    QueueWorkItemDto | boolean,
    QueueWorkItemDto
  >(selectedRowIds, workItemsOptimisticMutationFn, DATA_QUERY_KEY);

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
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "items" : "item"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
