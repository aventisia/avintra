import { Separator } from "@aventisia/ui";
import { DataTableRowActions } from "@aventisia/ui/data-table";

import { AgentDisableAction } from "./AgentDisableAction";
import { AssignMachineRowAction } from "./AssignMachineRowAction";
import { AssignUserRowAction } from "./AssignUserRowAction";
import { EnableAgentRowAction } from "./EnableAgentRowAction";

type TableActionsProps = {
  rowId: string;
  isDisabled: boolean;
  count: number;
  type: string;
};
export const TableActions = ({
  rowId,
  isDisabled,
  type,
}: TableActionsProps) => {
  return (
    <DataTableRowActions>
      {type == "ChatAgent" ? (
        <AssignUserRowAction rowId={rowId} isDisabled={isDisabled} />
      ) : (
        <AssignMachineRowAction rowId={rowId} isDisabled={isDisabled} />
      )}{" "}
      <Separator />
      {isDisabled ? (
        <EnableAgentRowAction rowId={rowId} />
      ) : (
        <AgentDisableAction rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
