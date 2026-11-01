import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { queueOptimisticMutationFn } from "../../apis/queues-table-apis";
import { QueuesTableDto } from "../../dtos/queues-table-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface QueueBulkActionsProps {
  table: Table<QueuesTableDto>;
}

export function QueueBulkActions({ table }: Readonly<QueueBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the queue
  const { mutate: deletequeues } = useListOptimisticMutation<
    string[],
    QueuesTableDto | boolean,
    QueuesTableDto
  >(selectedRowIds, queueOptimisticMutationFn, queryKey);

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={Trash2}
          tone="destructive"
          disabled={locked}
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
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
