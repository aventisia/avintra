import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";

import { flowOptimisticMutationFn } from "../apis/flows-table-apis";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { useTableTab } from "../hooks/useTableTab";

interface FlowsBulkActionsProps {
  table: Table<FlowsTableDto>;
}

export function FlowsBulkActions({ table }: FlowsBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // queryKey already includes the current space id and tab segment
  const { queryKey } = useTableTab();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the flows
  const { mutate: deleteFlows } = useListOptimisticMutation<
    string[],
    FlowsTableDto | boolean,
    FlowsTableDto
  >(selectedRowIds, flowOptimisticMutationFn, queryKey);

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
                  // Delete selected flows
                  deleteFlows({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "agents" : "agent"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
