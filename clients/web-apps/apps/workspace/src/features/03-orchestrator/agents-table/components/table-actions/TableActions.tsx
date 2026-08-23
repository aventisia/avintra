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
  flowName?: string | null;
  flowVersionNumber?: number;
};
export const TableActions = ({
  rowId,
  isDisabled,
  type,
  flowName,
  flowVersionNumber,
}: TableActionsProps) => {
  return (
    <DataTableRowActions>
      {type == "ChatAgent" ? (
        <AssignUserRowAction rowId={rowId} isDisabled={isDisabled} />
      ) : (
        <AssignMachineRowAction
          rowId={rowId}
          isDisabled={isDisabled}
          flowName={flowName}
          flowVersionNumber={flowVersionNumber}
        />
      )}{" "}
      <AgentConfigRowAction rowId={rowId} isDisabled={isDisabled} />
      <Separator />
      {isDisabled ? <EnableAgentRowAction rowId={rowId} /> : <AgentDisableAction rowId={rowId} />}
    </DataTableRowActions>
  );
};
