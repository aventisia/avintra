import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DTBulkActions } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkActions";
import { DTBulkDeleteAction } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkDeleteAction";
import { DTSelectionInfo } from "@/react-toolkit/ui/data-table/bulk-actions/DTSelectionInfo";
import { Separator } from "@/react-toolkit/ui/separator";

import { Table } from "@tanstack/react-table";

import { pricingPlanOptimisticMutationFn } from "../../apis/pricingPlans-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { PricingPlansTableDto } from "../../dtos/pricingPlans-table-dto";

interface PricingPlansBulkActionsProps {
  table: Table<PricingPlansTableDto>;
}

export function PricingPlansBulkActions({
  table,
}: Readonly<PricingPlansBulkActionsProps>) {
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
    PricingPlansTableDto | boolean,
    PricingPlansTableDto
  >(selectedRowIds, pricingPlanOptimisticMutationFn, DATA_QUERY_KEY);

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
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "plans" : "plan"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
