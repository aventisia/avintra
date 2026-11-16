import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { TrashIcon } from "@phosphor-icons/react";
import { Table } from "@tanstack/react-table";

import { configStoreOptimisticMutationFn } from "../../apis/config-stores-table-apis";
import { ConfigStoresTableDto } from "../../dtos/config-stores-table-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface ConfigStoresBulkActionsProps {
  table: Table<ConfigStoresTableDto>;
}

export function ConfigStoresBulkActions({ table }: Readonly<ConfigStoresBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  // queryKey already includes the current space id and tab segment
  const { queryKey } = useTableTab();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the config store
  const { mutate: deleteConfigStores } = useListOptimisticMutation<
    string[],
    ConfigStoresTableDto | boolean,
    ConfigStoresTableDto
  >(selectedRowIds, configStoreOptimisticMutationFn, queryKey);

  // TODO: Rollback selection if there is an error

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={TrashIcon}
          tone="destructive"
          disabled={locked}
          onClick={() => {
            // Show alert dialog to confirm delete
            showDefaultAlertDialog({
              confirmActionFn: () => {
                // Delete selected config stores
                deleteConfigStores({
                  payload: selectedRowIds,
                  crudAction: "delete-multiple",
                });

                // Remove selection
                table.toggleAllRowsSelected(false);
              },
              alertType: "delete-multiple",
              additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "key stores" : "key store"}`,
            });
          }}
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
