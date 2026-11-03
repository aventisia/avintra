import { Separator } from "@avplatform/ui";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";

import { AgentConfigRowAction } from "./AgentConfigRowAction";
import { AgentDisableAction } from "./AgentDisableAction";
import { AssignMachineRowAction } from "./AssignMachineRowAction";
import { EnableAgentRowAction } from "./EnableAgentRowAction";

type TableActionsProps = {
  rowId: string;
  isDisabled: boolean;
  count: number;
  type: string;
  flowName?: string | null;
  flowVersionNumber?: number;
  supportedPlatform?: string;
  isTenantWideAccess: boolean;
};
export const TableActions = ({
  rowId,
  isDisabled,
  type,
  flowName,
  flowVersionNumber,
  supportedPlatform,
  isTenantWideAccess,
}: TableActionsProps) => {
  return (
    <TableCNRowActionsMenu ariaLabel="Open agent actions">
      {type == "ChatAgent" ? (
        <ResourceUserAccessRowAction
          rowId={rowId}
          resourceName={flowName ?? ""}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.FlowVersion}
          disabled={isDisabled}
        />
      ) : (
        <AssignMachineRowAction
          rowId={rowId}
          isDisabled={isDisabled}
          flowName={flowName}
          flowVersionNumber={flowVersionNumber}
          supportedPlatform={supportedPlatform}
        />
      )}{" "}
      <AgentConfigRowAction rowId={rowId} isDisabled={isDisabled} />
      <Separator />
      {isDisabled ? <EnableAgentRowAction rowId={rowId} /> : <AgentDisableAction rowId={rowId} />}
    </TableCNRowActionsMenu>
  );
};
