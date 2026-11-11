import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";

import { creditOptimisticMutationFn } from "../apis/credit-plans-table-apis.ee";
import { CREDIT_PLANS_QUERY_KEY } from "../constants";
import { CreditPlansTableDto } from "../dtos/credit-plans-table-dto.ee";

interface CreditBulkActionsProps {
  table: Table<CreditPlansTableDto>;
}

export function CreditsBulkActions({ table }: CreditBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the credit
  const { mutate: deleteCreditPlans } = useListOptimisticMutation<
    string[],
    CreditPlansTableDto | boolean,
    CreditPlansTableDto
  >(selectedRowIds, creditOptimisticMutationFn, CREDIT_PLANS_QUERY_KEY);

  // TODO: Rollback selection if there is an error

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
                  // Delete selected models
                  deleteCreditPlans({
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
