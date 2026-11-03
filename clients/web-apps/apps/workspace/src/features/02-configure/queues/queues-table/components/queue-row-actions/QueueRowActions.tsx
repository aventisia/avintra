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
import { QueueRowDeleteAction } from "./QueueRowDeleteAction";
import { UploadItemsRowAction } from "./UploadItemsRowAction";

interface QueueRowActionsProps {
  rowId: string;
  queueName: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
  isResourceAccessRestricted: boolean;
}

export const QueueRowActions = ({
  rowId,
  queueName,
  accessLevel,
  isTenantWideAccess,
  isResourceAccessRestricted,
}: QueueRowActionsProps) => {
  const { actions, isProd, resourceActions } = useConfigureResourceAccessActions(accessLevel);

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  return (
    // Dropdown menu for Queue table row action */}
    <TableCNRowActionsMenu ariaLabel="Open queue actions" contentClassName="w-36 min-w-36">
      {isProd && <CrudRowAction rowId={rowId} crudAction="read" entity="queue" />}
      {/* Edit Queue details */}
      {actions?.update && <CrudRowAction rowId={rowId} crudAction="update" entity="queue" />}

      {actions?.update && (
        <ResourceFlowAccessRowAction
          rowId={rowId}
          resourceName={queueName}
          resourceType={ResourceTypeEnum.Queue}
          isRestricted={isResourceAccessRestricted}
          disabled={isProd}
        />
      )}

      {actions?.update && <UploadItemsRowAction rowId={rowId} />}

      {/* Share Access */}
      {resourceActions.share && (
        <ResourceUserAccessRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.Queue}
          resourceName={queueName}
          disabled={isProd}
        />
      )}
      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Queue delete alert dialog  */}
      {resourceActions.delete && <QueueRowDeleteAction rowId={rowId} />}

      {/* Remove the resource from the user's shared list (shown for rows not owned by the user) */}
      {accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} disabled={isProd} />
      )}
    </TableCNRowActionsMenu>
  );
};
