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

import { roleOptimisticMutationFn } from "../../apis/roles-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { RoleTableDTO } from "../../dtos/roles-table-dto";

interface RolesBulkActionsProps {
  table: Table<RoleTableDTO>;
}

export function RolesBulkActions({ table }: Readonly<RolesBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the config
  const { mutate: deleteMultiplePricingPlans } = useListOptimisticMutation<
    string[],
    RoleTableDTO | boolean,
    RoleTableDTO
  >(selectedRowIds, roleOptimisticMutationFn, DATA_QUERY_KEY);

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
                // Delete selected configs
                deleteMultiplePricingPlans({
                  crudAction: "delete-multiple",
                  payload: selectedRowIds,
                });

                // Remove selection
                table.toggleAllRowsSelected(false);
              },
              alertType: "delete-multiple",
              additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "configs" : "config"}`,
            });
          }}
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
