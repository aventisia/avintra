import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import { Trash2Icon } from "lucide-react";

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
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <TableCNActionBarItem
        icon={Trash2Icon}
        tone="destructive"
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
      >
        Delete
      </TableCNActionBarItem>
    </TableCNActionBar>
  );
}
