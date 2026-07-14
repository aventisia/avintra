import { DTRowAction, DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { AssignAgentRowAction } from "./AssignAgentRowAction";
import { MachineRowDeleteAction } from "./MachineRowDeleteAction";

interface MachineRowActionsProps {
  rowId: string;
  osID: string;
}

export const MachineRowActions = ({ rowId, osID }: MachineRowActionsProps) => {
  return (
    // Dropdown menu for machine table row action */}
    <DataTableRowActions>
      <AssignAgentRowAction rowId={rowId} osID={osID} />

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
