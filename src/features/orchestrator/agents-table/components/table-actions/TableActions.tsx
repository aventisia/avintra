import { Separator } from "@aventisia/ui";
import { DTRowAction } from "@aventisia/ui/data-table";
import { DataTableRowActions } from "@aventisia/ui/data-table";

import { AgentRowDeleteAction } from "./AgentRowDeleteAction";
import { AssignMachineRowAction } from "./AssignMachineRowAction";

type TableActionsProps = {
  rowId: string;
};
export const TableActions = ({ rowId }: TableActionsProps) => {
  return (
    <DataTableRowActions>
      <DTRowAction rowId={rowId} crudAction="read" />
      <AssignMachineRowAction rowId={rowId} />
      <Separator />
      <AgentRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
