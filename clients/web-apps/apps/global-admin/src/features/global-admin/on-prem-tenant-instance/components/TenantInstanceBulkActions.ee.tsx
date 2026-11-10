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
import { useParams } from "react-router-dom";

import { TenantInstanceOptimisticMutationFn } from "../apis/tenant-instance-apis.ee";
import { TENANT_INSTANCE_QUERY_KEY } from "../constants";
import { OnPremInstanceDto } from "../dtos/tenant-instance-dto.ee";

interface TenantInstanceBulkActionsProps {
  table: Table<OnPremInstanceDto>;
}

export function TenantInstanceBulkActions({ table }: TenantInstanceBulkActionsProps) {
  const { tid = "" } = useParams();

  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the instances
  const { mutate: deleteTenants } = useListOptimisticMutation<
    string[],
    OnPremInstanceDto | boolean,
    OnPremInstanceDto
  >(selectedRowIds, TenantInstanceOptimisticMutationFn, [TENANT_INSTANCE_QUERY_KEY, tid]);

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
                // Delete selected instances
                deleteTenants({
                  payload: selectedRowIds,
                  crudAction: "delete-multiple",
                });

                // Remove selection
                table.toggleAllRowsSelected(false);
              },
              alertType: "delete-multiple",
              additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "instances" : "instance"}`,
            });
          }}
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
