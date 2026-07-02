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

import { jobOptimisticMutationFn } from "../apis/jobs-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { JobsTableDto } from "../dtos/jobs-table-dto";

interface JobsBulkActionsProps {
  table: Table<JobsTableDto>;
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
    JobsTableDto | boolean,
    JobsTableDto
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
                  // Delete selected jobs
                  deleteJobs({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  // Remove selection
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
