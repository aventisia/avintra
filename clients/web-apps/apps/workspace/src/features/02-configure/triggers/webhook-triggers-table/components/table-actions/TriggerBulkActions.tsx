import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { TrashIcon } from "@phosphor-icons/react";
import { Table } from "@tanstack/react-table";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { WebhookTriggerDto } from "../../dtos/webhook-trigger-dto";

interface TriggerBulkActionsProps {
  table: Table<WebhookTriggerDto>;
}

export function TriggerBulkActions({ table }: Readonly<TriggerBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the trigger
  const { mutate: deletetriggers } = useListOptimisticMutation<
    string[],
    WebhookTriggerDto | boolean,
    WebhookTriggerDto
  >(selectedRowIds, triggerOptimisticMutationFn, DATA_QUERY_KEY);

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <TableCNActionBarItem
        icon={TrashIcon}
        tone="destructive"
        onClick={() => {
          // Show alert dialog to confirm delete
          showDefaultAlertDialog({
            confirmActionFn: () => {
              // Delete selected triggers
              deletetriggers({
                payload: selectedRowIds,
                crudAction: "delete-multiple",
              });

              // Remove selection
              table.toggleAllRowsSelected(false);
            },
            alertType: "delete-multiple",
            additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "triggers" : "trigger"}`,
          });
        }}
      >
        Delete
      </TableCNActionBarItem>
    </TableCNActionBar>
  );
}
