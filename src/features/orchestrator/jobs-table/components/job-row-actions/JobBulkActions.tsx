import { DTBulkActions } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkActions";
import { DTSelectionInfo } from "@/react-toolkit/ui/data-table/bulk-actions/DTSelectionInfo";
import { Separator } from "@/react-toolkit/ui/separator";
import { Table } from "@tanstack/react-table";

import { JobStatusTypesEnum } from "@/react-toolkit/enums/job-status-type-enum";
import type { JobsTableDto } from "../../dtos/jobs-table-dto";
import { JobBulkRetryAction } from "./JobBulkRetryAction";
import { DTBulkDeleteAction } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkDeleteAction";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { DATA_QUERY_KEY } from "../../constants";
import { JobOptimisticMutationFn, retryJobs } from "../../apis/jobs-table-apis";
import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";

interface JobBulkActionsProps {
  table: Table<JobsTableDto>;
}

export function JobBulkActions({ table }: Readonly<JobBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog, showCustomAlertDialog } =
    useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds =
    table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id)
      .filter((id): id is string => id !== undefined) || true;

  const failedCount = table
    .getFilteredSelectedRowModel()
    .rows.some((row) => row.original.status === JobStatusTypesEnum.Failed);

  // Get mutation function to delete the project
  const { mutate: deleteJobs } = useListOptimisticMutation<
    string[],
    JobsTableDto | boolean,
    JobsTableDto
  >(selectedRowIds, JobOptimisticMutationFn, DATA_QUERY_KEY);

  // Get mutation function to delete the project
  const { mutate: mutateRetryJobs } = useOptimisticMutation<
    string[],
    string | boolean,
    string
  >(retryJobs, DATA_QUERY_KEY, selectedRowIds);

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
          {failedCount && (
            <>
              <Separator
                orientation="vertical"
                className="h-6 w-[0.5px]"
                onClick={() => {
                  // Show alert dialog to confirm delete
                  showCustomAlertDialog({
                    title: "Retry Selected",
                    description: "Are sure to retry all the selected jobs?",
                    confirmActionFn: () => {
                      // Delete selected jobs
                      mutateRetryJobs(selectedRowIds);
                      // Remove selection
                      table.toggleAllRowsSelected(false);
                    },
                  });
                }}
              />
              <JobBulkRetryAction />
            </>
          )}
        </DTBulkActions>
      )}
    </>
  );
}
