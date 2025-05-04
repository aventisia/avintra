import { DataTableRowActions, DTRowAction } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { MachineRowDeleteAction } from "./MachineRowDeleteAction";

interface MachineRowActionsProps {
  rowId: string;
}

export const MachineRowActions = ({ rowId }: MachineRowActionsProps) => {
  return (
    // Dropdown menu for machine table row action */}
    <DataTableRowActions>
      {/* View the machine details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit machine details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Machine delete alert dialog  */}
      <MachineRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
