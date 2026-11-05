import { Separator } from "@avplatform/ui";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";

import { UiBuilderRowActions } from "../published-ui/UiBuilderRowActions";
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
  if (type === "UI") {
    return (
      <TableCNRowActionsMenu ariaLabel="Open published UI actions">
        <UiBuilderRowActions
          rowId={rowId}
          isDisabled={isDisabled}
          isTenantWideAccess={isTenantWideAccess}
          projectName={flowName}
        />
      </TableCNRowActionsMenu>
    );
  }

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
