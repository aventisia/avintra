import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useShowAlertHandler, useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { deleteApiKeys } from "../../apis/api-key.apis";
import { DATA_QUERY_KEY } from "../../constants";
import type { ApiKeyDto } from "../../dtos/api-key.dto";

interface ApiKeyBulkActionsProps {
  table: Table<ApiKeyDto>;
}

/**
 * Bulk actions toolbar for the API keys table.
 */
export function ApiKeyBulkActions({ table }: ApiKeyBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Optimistic mutation for bulk delete
  const { mutate: deleteApiKeysMutation } = useTableRowOptimisticMutation<
    string[],
    number,
    ApiKeyDto
  >("delete-multiple", selectedRowIds, deleteApiKeys, DATA_QUERY_KEY);

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
            showDefaultAlertDialog({
              confirmActionFn: () => {
                deleteApiKeysMutation(selectedRowIds);
                table.toggleAllRowsSelected(false);
              },
              alertType: "delete-multiple",
              additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "API keys" : "API key"}`,
            });
          }}
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
