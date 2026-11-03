import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { MachineRowDeleteAction } from "./MachineRowDeleteAction";

interface MachineRowActionsProps {
  rowId: string;
}

export const MachineRowActions = ({ rowId }: MachineRowActionsProps) => {
  return (
    <TableCNRowActionsMenu ariaLabel="Open machine actions" contentClassName="!max-w-10">
      <CrudRowAction rowId={rowId} crudAction="read" entity="machine" />
      <CrudRowAction rowId={rowId} crudAction="update" entity="machine" />
      <DropdownMenuSeparator />
      <MachineRowDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
