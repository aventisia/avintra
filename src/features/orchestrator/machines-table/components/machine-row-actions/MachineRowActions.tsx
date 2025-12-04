import { DataTableRowActions, DTRowAction } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { AssignAgentRowAction } from "./AssignAgentRowAction";
import { MachineRowDeleteAction } from "./MachineRowDeleteAction";

interface MachineRowActionsProps {
  rowId: string;
  osId: string;
}

export const MachineRowActions = ({ rowId, osId }: MachineRowActionsProps) => {
  return (
    // Dropdown menu for machine table row action */}
    <DataTableRowActions>
      <AssignAgentRowAction rowId={rowId} osId={osId} />

      {/* View the machine details */}
      {/* <DTRowAction rowId={rowId} crudAction="read" /> */}

      {/* Edit machine details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Machine delete alert dialog  */}
      <MachineRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
