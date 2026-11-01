import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useShowAlertHandler, useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { deleteMachines } from "../../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { MachinesTableRowDto } from "../../dtos/machines-table-row-dto";

interface MachinesBulkActionsProps {
  table: Table<MachinesTableRowDto>;
}

export function MachinesBulkActions({ table }: MachinesBulkActionsProps) {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

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
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={Trash2}
          tone="destructive"
          disabled={locked}
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
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
