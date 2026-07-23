import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";

import { deleteMachines } from "../../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { MachinesTableRowDto } from "../../dtos/machines-table-row-dto";

interface MachinesBulkActionsProps {
  table: Table<MachinesTableRowDto>;
}

export function MachinesBulkActions({ table }: MachinesBulkActionsProps) {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Construct entity name for alert dialog
  const entityName = selectedRowIds.length > 1 ? `${selectedRowIds.length} machines` : `machine`;

  // Get mutation function to delete the machine
  const { mutate } = useTableRowOptimisticMutation<string[], number, MachinesTableRowDto>(
    "delete-multiple",
    selectedRowIds,
    deleteMachines,
    DATA_QUERY_KEY,
  );

  return (
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
            onClick={() => {
              showCustomAlertDialog({
                confirmActionFn: () => {
                  // Delete selected machines
                  mutate(selectedRowIds);

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                confirmBtnText: `Yes, delete ${entityName}`,
                title: `Delete ${entityName}?`,
                description: `Are you sure you want to delete selected ${entityName}? This action will unassign any agents connected to selected ${entityName}, which may affect your workflows.`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
