import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";

import { subPlanOptimisticMutationFn } from "../apis/sub-plans-table-apis.ee";
import { PLANS_QUERY_KEY } from "../constants";
import { SubPlansTableDto } from "../dtos/sub-plans-table-dto.ee";

interface SubPlansBulkActionsProps {
  table: Table<SubPlansTableDto>;
}

export function SubPlansBulkActions({ table }: SubPlansBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the plans
  const { mutate: deleteSubPlans } = useListOptimisticMutation<
    string[],
    SubPlansTableDto | boolean,
    SubPlansTableDto
  >(selectedRowIds, subPlanOptimisticMutationFn, PLANS_QUERY_KEY);

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
                  // Delete selected plans
                  deleteSubPlans({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "plans" : "plan"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
