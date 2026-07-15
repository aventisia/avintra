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
    <DataTableRowActions className="!max-w-10">
      <DTRowAction rowId={rowId} crudAction="read" />
      <DTRowAction rowId={rowId} crudAction="update" />
      <AssignAgentRowAction rowId={rowId} osID={osID} />
      <DropdownMenuSeparator />
      <MachineRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
