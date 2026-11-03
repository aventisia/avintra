import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { ResourceFlowAccessRowAction } from "@/features/resource-flow-access/components/common-row-actions/ResourceFlowAccessRowAction";
import { RemoveResourceRowAction } from "@/features/resource-user-access/components/common-row-actions/RemoveResourceRowAction";
import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";

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
    <TableCNRowActionsMenu ariaLabel="Open tool actions" contentClassName="w-36 min-w-36">
      <CrudRowAction rowId={rowId} crudAction="read" entity="tool" />

      {!isPlatformTool && actions?.update && (
        <CrudRowAction rowId={rowId} crudAction="update" entity="tool" />
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

      <DropdownMenuSeparator />

      {!isPlatformTool && resourceActions.delete && <ToolRowDeleteAction rowId={rowId} />}

      {!isPlatformTool && accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} disabled={isProd} />
      )}
    </TableCNRowActionsMenu>
  );
};
