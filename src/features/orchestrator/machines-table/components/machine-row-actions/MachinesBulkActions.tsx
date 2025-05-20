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

import { machineOptimisticMutationFn } from "../../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { MachinesTableDto } from "../../dtos/machines-table-dto";

interface MachinesBulkActionsProps {
  table: Table<MachinesTableDto>;
}

export function MachinesBulkActions({ table }: MachinesBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the machine
  const { mutate: deleteMachines } = useListOptimisticMutation<
    string[],
    MachinesTableDto | boolean,
    MachinesTableDto
  >(selectedRowIds, machineOptimisticMutationFn, DATA_QUERY_KEY);

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
                  // Delete selected machines
                  deleteMachines({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "machines" : "machine"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
