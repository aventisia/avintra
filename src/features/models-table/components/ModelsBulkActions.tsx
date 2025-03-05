import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DTBulkActions } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkActions";
import { DTBulkDeleteAction } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkDeleteAction";
import { DTSelectionInfo } from "@/react-toolkit/ui/data-table/bulk-actions/DTSelectionInfo";
import { Separator } from "@/react-toolkit/ui/separator";
import { Table } from "@tanstack/react-table";
import { modelOptimisticMutationFn } from "../apis/models-table-apis";
import { ModelsTableDto } from "../dtos/models-table-dto";
import { useShallow } from "zustand/react/shallow";
import { useModelsTableStore } from "../stores/models-table-store";

interface ModelsBulkActionsProps {
  table: Table<ModelsTableDto>;
}

export function ModelsBulkActions({ table }: ModelsBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get models store state and actions
    const { modelsQueryKey } = useModelsTableStore(
      useShallow((state) => ({
        modelsQueryKey: state.modelsQueryKey,
      })),
    );

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the model
  const { mutate: deleteModels } = useListOptimisticMutation<
    string[],
    ModelsTableDto | boolean,
    ModelsTableDto
  >(selectedRowIds, modelOptimisticMutationFn, modelsQueryKey);

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
                  deleteModels({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "models" : "model"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
