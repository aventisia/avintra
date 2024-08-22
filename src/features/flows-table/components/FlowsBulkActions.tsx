import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DTBulkActions } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkActions";
import { DTBulkDeleteAction } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkDeleteAction";
import { DTSelectionInfo } from "@/react-toolkit/ui/data-table/bulk-actions/DTSelectionInfo";
import { Separator } from "@/react-toolkit/ui/separator";
import { Table } from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";
import { flowOptimisticMutationFn } from "../apis/flows-table-apis";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { useFlowsTableStore } from "../stores/flows-table-store";

interface FlowsBulkActionsProps {
  table: Table<FlowsTableDto>;
}

export function FlowsBulkActions({ table }: FlowsBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get flows store state and actions
  const { flowsQueryKey } = useFlowsTableStore(
    useShallow((state) => ({
      flowsQueryKey: state.flowsQueryKey,
    })),
  );

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
  >(selectedRowIds, flowOptimisticMutationFn, flowsQueryKey);

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
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "flows" : "flow"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
