import { DTRowAction, DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { MachineRowDeleteAction } from "./MachineRowDeleteAction";

interface MachineRowActionsProps {
  rowId: string;
}

export const MachineRowActions = ({ rowId }: MachineRowActionsProps) => {
  return (
    <DataTableRowActions className="!max-w-10">
      <DTRowAction rowId={rowId} crudAction="read" />
      <DTRowAction rowId={rowId} crudAction="update" />
      <DropdownMenuSeparator />
      <MachineRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
