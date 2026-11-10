import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { ResourceFlowAccessRowAction } from "@/features/resource-flow-access/components/common-row-actions/ResourceFlowAccessRowAction";
import { RemoveResourceRowAction } from "@/features/resource-user-access/components/common-row-actions/RemoveResourceRowAction";
import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";

import { useTableTab } from "../../hooks/useTableTab";
import { ConfigStoreRowDeleteAction } from "./ConfigStoreRowDeleteAction";

interface ConfigStoreRowActionsProps {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
  isResourceAccessRestricted: boolean;
}

export const ConfigStoreRowActions = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
  isResourceAccessRestricted,
}: ConfigStoreRowActionsProps) => {
  const { actions, isProd, resourceActions } = useConfigureResourceAccessActions(accessLevel);

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  return (
    // Dropdown menu for config store table row action */}
    <TableCNRowActionsMenu ariaLabel="Open config store actions" contentClassName="w-36 min-w-36">
      {/* View the config store details */}
      {actions?.read && <CrudRowAction rowId={rowId} crudAction="read" entity="configstore" />}

      {/* Edit config store details */}
      {actions?.update && <CrudRowAction rowId={rowId} crudAction="update" entity="configstore" />}

      {/* Assign agents */}
      {actions?.update && (
        <ResourceFlowAccessRowAction
          rowId={rowId}
          resourceName={name}
          resourceType={ResourceTypeEnum.ConfigStore}
          isRestricted={isResourceAccessRestricted}
          disabled={isProd}
        />
      )}

      {/* Share Access */}
      {resourceActions.share && (
        <ResourceUserAccessRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.ConfigStore}
          resourceName={name}
          disabled={isProd}
        />
      )}

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Config store delete alert dialog  */}
      {resourceActions.delete && <ConfigStoreRowDeleteAction rowId={rowId} />}

      {/* Remove the resource from the user's shared list (shown for rows not owned by the user) */}
      {accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} disabled={isProd} />
      )}
    </TableCNRowActionsMenu>
  );
};
