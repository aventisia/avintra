import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { MachineRowDeleteAction } from "./MachineRowDeleteAction";
import { MachineRowOpenAction } from "./MachineRowOpenAction";

interface MachineRowActionsProps {
  rowId: string;
}

export const MachineRowActions = ({ rowId }: MachineRowActionsProps) => {
  return (
    // Dropdown menu for machine table row action */}
    <DataTableRowActions>
      {/* To open machine */}
      <MachineRowDeleteAction rowId={rowId} />

      {/* View the machine details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit machine details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers machine delete alert dialog  */}
      <MachineRowOpenAction rowId={rowId} />
    </DataTableRowActions>
  );
};
