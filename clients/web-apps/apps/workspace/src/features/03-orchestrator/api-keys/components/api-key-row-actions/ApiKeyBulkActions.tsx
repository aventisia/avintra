import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useShowAlertHandler, useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";

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
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
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
          />
        </DTBulkActions>
      )}
    </>
  );
}
