import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { creditOptimisticMutationFn } from "../apis/credit-plans-table-apis.ee";
import { CREDIT_PLANS_QUERY_KEY } from "../constants";
import { CreditPlansTableDto } from "../dtos/credit-plans-table-dto.ee";

interface CreditBulkActionsProps {
  table: Table<CreditPlansTableDto>;
}

export function CreditsBulkActions({ table }: CreditBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

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

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={Trash2}
          tone="destructive"
          disabled={locked}
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
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
