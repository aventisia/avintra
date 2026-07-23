import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";

import { DATA_QUERY_KEY, JobsTableRowDto, jobOptimisticMutationFn } from "..";

interface JobsBulkActionsProps {
  table: Table<JobsTableRowDto>;
}

export function JobsBulkActions({ table }: JobsBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the jobs
  const { mutate: deleteJobs } = useListOptimisticMutation<
    string[],
    JobsTableRowDto | boolean,
    JobsTableRowDto
  >(selectedRowIds, jobOptimisticMutationFn, DATA_QUERY_KEY);

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
                  deleteJobs({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "jobs" : "job"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
