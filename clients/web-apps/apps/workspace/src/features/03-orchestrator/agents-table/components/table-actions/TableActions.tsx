import { Separator } from "@avplatform/ui";
import { DataTableRowActions } from "@avplatform/ui/data-table";

import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";

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
    <DataTableRowActions>
      {type == "ChatAgent" ? (
        <ResourceShareRowAction
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
    </DataTableRowActions>
  );
};
