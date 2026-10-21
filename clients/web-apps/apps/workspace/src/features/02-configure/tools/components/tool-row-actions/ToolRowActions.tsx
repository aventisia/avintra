import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceFlowAccessRowAction } from "@/features/resource-share/components/common-row-actions/ResourceFlowAccessRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";

import { useTableTab } from "../../hooks/useTableTab.hook";
import { ToolRowDeleteAction } from "./ToolRowDeleteAction";

interface ToolRowActionsProps {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
  isResourceAccessRestricted: boolean;
  isPlatformTool?: boolean;
}

export const ToolRowActions = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
  isResourceAccessRestricted,
  isPlatformTool = false,
}: ToolRowActionsProps) => {
  const { actions, isProd, resourceActions } = useConfigureResourceAccessActions(accessLevel);
  // Get the query key used to invalidate the merged tools list after a mutation
  const { queryKey } = useTableTab();

  return (
    <DataTableRowActions className="w-36 min-w-36">
      <DTRowAction rowId={rowId} crudAction="read" entity="tool" />

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
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.Tool}
          resourceName={name}
          disabled={isProd}
        />
      )}

      <DropdownMenuSeparator />

      {!isPlatformTool && resourceActions.delete && <ToolRowDeleteAction rowId={rowId} />}

      {!isPlatformTool && accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} disabled={isProd} />
      )}
    </DataTableRowActions>
  );
};
