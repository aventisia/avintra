import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  DTBulkActions,
  DTBulkDeleteAction,
  DTSelectionInfo,
} from "@aventisia/ui/data-table";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { Table } from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";

import { fineTuneOptimisticMutationFn } from "../apis/fine-tune-table-apis";
import { FINE_TUNE_TABLE_QUERY_KEY } from "../constants";
import { FineTuneTableDTO } from "../dtos/fine-tune-table-dto";

interface FineTuneBulkActionsProps {
  table: Table<FineTuneTableDTO>;
}

export function FineTuneBulkActions({ table }: FineTuneBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { setShowDialog } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the record
  const { mutate: deleteRecords } = useListOptimisticMutation<
    string[],
    FineTuneTableDTO | boolean,
    FineTuneTableDTO
  >(selectedRowIds, fineTuneOptimisticMutationFn, FINE_TUNE_TABLE_QUERY_KEY);

  return (
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <Button onClick={() => setShowDialog(true)}>
            Schedule Fine-tuning
          </Button>
          <DTBulkDeleteAction
            onClick={() => {
              // Show alert dialog to confirm delete
              showDefaultAlertDialog({
                confirmActionFn: () => {
                  // Delete selected records
                  deleteRecords({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "records" : "record"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
