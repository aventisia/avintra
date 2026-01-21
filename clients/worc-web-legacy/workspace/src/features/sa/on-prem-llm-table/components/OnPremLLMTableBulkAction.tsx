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

import { onPremLLMOptimisticMutationFn } from "../apis/on-prem-llm-table-apis";
import { ONPREM_LLM_QUERY_KEY } from "../constants";
import { OnPremModelDto } from "../dtos/on-prem-llm-table-dto";

interface OnPremLLMBulkActionsProps {
  table: Table<OnPremModelDto>;
}

export function OnPremLLMBulkActions({ table }: OnPremLLMBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the credit
  const { mutate: deleteOnPremLLMs } = useListOptimisticMutation<
    string[],
    OnPremModelDto | boolean,
    OnPremModelDto
  >(selectedRowIds, onPremLLMOptimisticMutationFn, ONPREM_LLM_QUERY_KEY);

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
                  deleteOnPremLLMs({
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
