import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useOptimisticMutation, useQueryData, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { ProhibitIcon } from "@phosphor-icons/react";
import { Table } from "@tanstack/react-table";

import { disableTenants } from "../apis/tenants-table-apis.ee";
import { DATA_QUERY_KEY } from "../constants";
import { TenantsTableDto } from "../dtos/tenants-table-dto.ee";

interface TenantsBulkActionsProps {
  table: Table<TenantsTableDto>;
}

export function TenantsBulkActions({ table }: TenantsBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  // Get tenants query data
  const tenantsQueryData = useQueryData<TenantsTableDto>(DATA_QUERY_KEY);

  // Disable tenants in query data
  const disableTenantsInQueryData = (ids: string[]) => {
    return tenantsQueryData?.map((tenant) => {
      if (tenant.id && ids.includes(tenant.id)) return { ...tenant, isDisabled: true };
      return tenant;
    });
  };

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to disable multiple tenants
  const { mutate: disableMultipleTenants } = useOptimisticMutation<
    string[],
    boolean,
    TenantsTableDto
  >(disableTenants, DATA_QUERY_KEY, disableTenantsInQueryData(selectedRowIds));

  // Disable selected tenants handler
  const disableSelectedTenantsHandler = () => {
    // Show alert dialog to confirm multiple disable
    showDefaultAlertDialog({
      confirmActionFn: () => disableMultipleTenants(selectedRowIds),
      alertType: "disable-multiple",
      additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "tenants" : "tenant"}`,
    });
  };

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={ProhibitIcon}
          disabled={locked}
          onClick={disableSelectedTenantsHandler}
        >
          Disable
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
