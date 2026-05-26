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
import { useParams } from "react-router-dom";

import { TenantInstanceOptimisticMutationFn } from "../apis/tenant-instance-apis";
import { TENANT_INSTANCE_QUERY_KEY } from "../constants";
import { OnPremInstanceDto } from "../dtos/tenant-instance-dto";

interface TenantInstanceBulkActionsProps {
  table: Table<OnPremInstanceDto>;
}

export function TenantInstanceBulkActions({
  table,
}: TenantInstanceBulkActionsProps) {
  const { tid = "" } = useParams();

  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

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
  >(selectedRowIds, TenantInstanceOptimisticMutationFn, [
    TENANT_INSTANCE_QUERY_KEY,
    tid,
  ]);

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
          />
        </DTBulkActions>
      )}
    </>
  );
}
