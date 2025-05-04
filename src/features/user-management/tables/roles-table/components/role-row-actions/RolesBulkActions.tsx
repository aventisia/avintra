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

import { roleOptimisticMutationFn } from "../../apis/roles-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { RoleTableDTO } from "../../dtos/roles-table-dto";

interface RolesBulkActionsProps {
  table: Table<RoleTableDTO>;
}

export function RolesBulkActions({ table }: Readonly<RolesBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

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
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
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
          />
        </DTBulkActions>
      )}
    </>
  );
}
