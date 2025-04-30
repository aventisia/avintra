import { ExecutionStatusTypesEnum } from "@/react-toolkit/enums/execution-status-type-enum";

import { Separator } from "@aventisia/ui";
import { DTBulkActions } from "@aventisia/ui/data-table";
import { DTBulkDeleteAction } from "@aventisia/ui/data-table";
import { DTSelectionInfo } from "@aventisia/ui/data-table";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useOptimisticMutation } from "@aventisia/ui/hooks";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { Table } from "@tanstack/react-table";

import {
  ExecutionOptimisticMutationFn,
  retryExecutions,
} from "../../apis/executions-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import type { ExecutionsTableDto } from "../../dtos/executions-table-dto";
import { ExecutionBulkRetryAction } from "./ExecutionBulkRetryAction";

interface ExecutionBulkActionsProps {
  table: Table<ExecutionsTableDto>;
}

export function ExecutionBulkActions({
  table,
}: Readonly<ExecutionBulkActionsProps>) {
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
    .rows.some(
      (row) => row.original.status === ExecutionStatusTypesEnum.Failed,
    );

  // Get mutation function to delete the project
  const { mutate: deleteExecutions } = useListOptimisticMutation<
    string[],
    ExecutionsTableDto | boolean,
    ExecutionsTableDto
  >(selectedRowIds, ExecutionOptimisticMutationFn, DATA_QUERY_KEY);

  // Get mutation function to delete the project
  const { mutate: mutateRetryExecutions } = useOptimisticMutation<
    string[],
    string | boolean,
    string
  >(retryExecutions, DATA_QUERY_KEY, selectedRowIds);

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
                  // Delete selected executions
                  deleteExecutions({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "executions" : "execution"}`,
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
                    description:
                      "Are sure to retry all the selected executions?",
                    confirmActionFn: () => {
                      // Delete selected executions
                      mutateRetryExecutions(selectedRowIds);
                      // Remove selection
                      table.toggleAllRowsSelected(false);
                    },
                  });
                }}
              />
              <ExecutionBulkRetryAction />
            </>
          )}
        </DTBulkActions>
      )}
    </>
  );
}
