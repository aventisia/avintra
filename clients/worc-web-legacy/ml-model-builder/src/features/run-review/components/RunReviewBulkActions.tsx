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

import { runReviewOptimisticMutationFn } from "../apis/run-review-table-apis";
import { RUN_REIVEW_TABLE_QUERY_KEY } from "../constants";
import { RunReviewTableDTO } from "../dtos/run-review-table-dto";

interface RunReviewBulkActionsProps {
  table: Table<RunReviewTableDTO>;
}

export function RunReviewBulkActions({ table }: RunReviewBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the record
  const { mutate: deleteRecords } = useListOptimisticMutation<
    string[],
    RunReviewTableDTO | boolean,
    RunReviewTableDTO
  >(selectedRowIds, runReviewOptimisticMutationFn, RUN_REIVEW_TABLE_QUERY_KEY);

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
