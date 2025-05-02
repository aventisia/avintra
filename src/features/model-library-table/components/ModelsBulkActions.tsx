import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { DTBulkActions } from "@aventisia/ui/data-table";
import { DTBulkDeleteAction } from "@aventisia/ui/data-table";
import { DTSelectionInfo } from "@aventisia/ui/data-table";
import { Separator } from "@aventisia/ui";
import { Table } from "@tanstack/react-table";
import { modelOptimisticMutationFn } from "../apis/model-library-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { ModelLibraryTableDto } from "../dtos/model-library-table-dto";

interface ModelsBulkActionsProps {
  table: Table<ModelLibraryTableDto>;
}

export function ModelsBulkActions({ table }: ModelsBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the model
  const { mutate: deleteModels } = useListOptimisticMutation<
    string[],
    ModelLibraryTableDto | boolean,
    ModelLibraryTableDto
  >(selectedRowIds, modelOptimisticMutationFn, DATA_QUERY_KEY);

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
