import { Separator } from "@aventisia/ui";
import { DataTableRowActions } from "@aventisia/ui/data-table";

import { AgentDisableAction } from "./AgentDisableAction";
import { AssignMachineRowAction } from "./AssignMachineRowAction";
import { EnableAgentRowAction } from "./EnableAgentRowAction";

type TableActionsProps = {
  rowId: string;
  isDisabled: boolean;
  count: number;
};
export const TableActions = ({ rowId, isDisabled }: TableActionsProps) => {
  return (
    <DataTableRowActions>
      <AssignMachineRowAction rowId={rowId} isDisabled={isDisabled} />
      <Separator />
      {isDisabled ? (
        <EnableAgentRowAction rowId={rowId} />
      ) : (
        <AgentDisableAction rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
