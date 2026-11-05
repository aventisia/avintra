import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { ResourceFlowAccessRowAction } from "@/features/resource-flow-access/components/common-row-actions/ResourceFlowAccessRowAction";
import { RemoveResourceRowAction } from "@/features/resource-user-access/components/common-row-actions/RemoveResourceRowAction";
import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";

import { useTableTab } from "../../hooks/useTableTab.hook";
import { ToolRowDeleteAction } from "./ToolRowDeleteAction";
import { ToolRowToggleEnabledAction } from "./ToolRowToggleEnabledAction";

type ToolRowActionsProps = {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
  isResourceAccessRestricted: boolean;
  isPlatformTool?: boolean;
  isEnabled?: boolean;
};

export const ToolRowActions = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
  isResourceAccessRestricted,
  isPlatformTool = false,
  isEnabled = false,
}: ToolRowActionsProps) => {
  const { actions, isProd, resourceActions } = useConfigureResourceAccessActions(accessLevel);
  const { queryKey } = useTableTab();

  return (
    <DataTableRowActions className="w-36 min-w-36">
      <DTRowAction rowId={rowId} crudAction="read" entity="tool" />

      {isPlatformTool && <ToolRowToggleEnabledAction toolId={rowId} isEnabled={isEnabled} />}

      {!isPlatformTool && actions?.update && (
        <DTRowAction rowId={rowId} crudAction="update" entity="tool" />
      )}

      {!isPlatformTool && actions?.update && (
        <ResourceFlowAccessRowAction
          rowId={rowId}
          resourceName={name}
          resourceType={ResourceTypeEnum.Tool}
          isRestricted={isResourceAccessRestricted}
          disabled={isProd}
        />
      )}

      {!isPlatformTool && resourceActions.share && (
        <ResourceUserAccessRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.Tool}
          resourceName={name}
          disabled={isProd}
        />
      )}

      {!isPlatformTool && (
        <>
          <DropdownMenuSeparator />

          {resourceActions.delete && <ToolRowDeleteAction rowId={rowId} />}

          {accessLevel !== ResourceAccessTypeEnum.Owner && (
            <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} disabled={isProd} />
          )}
        </>
      )}
    </DataTableRowActions>
  );
};
