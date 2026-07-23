import { Separator } from "@avplatform/ui";
import { DataTableRowActions } from "@avplatform/ui/data-table";

import { AgentConfigRowAction } from "./AgentConfigRowAction";
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
export const TableActions = ({ rowId, isDisabled, type }: TableActionsProps) => {
  return (
    <DataTableRowActions>
      {type == "ChatAgent" ? (
        <AssignUserRowAction rowId={rowId} isDisabled={isDisabled} />
      ) : (
        <AssignMachineRowAction rowId={rowId} isDisabled={isDisabled} />
      )}{" "}
      <AgentConfigRowAction rowId={rowId} isDisabled={isDisabled} />
      <Separator />
      {isDisabled ? <EnableAgentRowAction rowId={rowId} /> : <AgentDisableAction rowId={rowId} />}
    </DataTableRowActions>
  );
};
