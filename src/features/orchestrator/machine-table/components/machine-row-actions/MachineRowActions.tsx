import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { MachineRowDeleteAction } from "./MachineRowDeleteAction";
import { MachineRowAssignmentAction } from "./MachineRowAssignmentAction";

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

      {/* Triggers assign flow or agent to the machine dialog*/}
      <MachineRowAssignmentAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers machine delete alert dialog  */}
      <MachineRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
