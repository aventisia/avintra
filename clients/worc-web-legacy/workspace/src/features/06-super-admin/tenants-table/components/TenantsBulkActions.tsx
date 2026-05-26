import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { DTBulkActions, DTSelectionInfo } from "@aventisia/ui/data-table";
import {
  useOptimisticMutation,
  useQueryData,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";
import { Table } from "@tanstack/react-table";
import { CircleOff } from "lucide-react";

import { disableTenants } from "../apis/tenants-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { TenantsTableDto } from "../dtos/tenants-table-dto";

interface TenantsBulkActionsProps {
  table: Table<TenantsTableDto>;
}

export function TenantsBulkActions({ table }: TenantsBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get tenants query data
  const tenantsQueryData = useQueryData<TenantsTableDto>(DATA_QUERY_KEY);

  // Disable tenants in query data
  const disableTenantsInQueryData = (ids: string[]) => {
    return tenantsQueryData?.map((tenant) => {
      if (tenant.id && ids.includes(tenant.id))
        return { ...tenant, isDisabled: true };
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
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <Button
            variant="ghost"
            size="xs"
            className="gap-2.5 text-sm tracking-wide"
            onClick={disableSelectedTenantsHandler}
          >
            <CircleOff className="h-3.5 w-3.5 text-[--icon-color]" />
            Disable
          </Button>
        </DTBulkActions>
      )}
    </>
  );
}
