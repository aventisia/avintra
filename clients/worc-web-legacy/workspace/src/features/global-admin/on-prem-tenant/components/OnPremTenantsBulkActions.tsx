import { Separator } from "@aventisia/ui";
import {
  DTBulkActions,
  DTBulkDeleteAction,
  DTSelectionInfo,
} from "@aventisia/ui/data-table";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";
import { Table } from "@tanstack/react-table";

import { OnPremTenantOptimisticMutationFn } from "../apis/on-prem-tenant-apis";
import { ON_PREM_TENANT_QUERY_KEY } from "../constants";
import { OnPremTenantDto } from "../dtos/on-prem-tenant-dto";

interface OnPremTenantsBulkActionsProps {
  table: Table<OnPremTenantDto>;
}

export function OnPremTenantsBulkActions({
  table,
}: OnPremTenantsBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

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
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
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
          />
        </DTBulkActions>
      )}
    </>
  );
}
