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

import { OnPremTenantOptimisticMutationFn } from "../apis/on-prem-tenant-apis.ee";
import { ON_PREM_TENANT_QUERY_KEY } from "../constants";
import { OnPremTenantDto } from "../dtos/on-prem-tenant-dto.ee";

interface OnPremTenantsBulkActionsProps {
  table: Table<OnPremTenantDto>;
}

export function OnPremTenantsBulkActions({ table }: OnPremTenantsBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the tenants
  const { mutate: deleteTenants } = useListOptimisticMutation<
    string[],
    OnPremTenantDto | boolean,
    OnPremTenantDto
  >(selectedRowIds, OnPremTenantOptimisticMutationFn, ON_PREM_TENANT_QUERY_KEY);

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
            showDefaultAlertDialog({
              confirmActionFn: () => {
                // Delete selected tenants
                deleteTenants({
                  payload: selectedRowIds,
                  crudAction: "delete-multiple",
                });

                // Remove selection
                table.toggleAllRowsSelected(false);
              },
              alertType: "delete-multiple",
              additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "tenants" : "tenant"}`,
            });
          }}
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
