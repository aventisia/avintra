import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { RemoveResourceRowAction } from "@/features/resource-user-access/components/common-row-actions/RemoveResourceRowAction";
import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";

import { useTableTab } from "../../hooks/useTableTab";
import { TriggerRowDeleteAction } from "./TriggerRowDeleteAction";

interface TriggerRowActionsProps {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
}

export const TriggerRowActions = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
}: TriggerRowActionsProps) => {
  const { actions, isProd, resourceActions } = useConfigureResourceAccessActions(accessLevel);

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  return (
    // Dropdown menu for Trigger table row action */}
    <TableCNRowActionsMenu ariaLabel="Open trigger actions" contentClassName="w-36 min-w-36">
      {/* View the Trigger details */}
      {actions?.read && <CrudRowAction rowId={rowId} crudAction="read" entity="timeTrigger" />}
      {/* Edit Trigger details */}
      {actions?.update && <CrudRowAction rowId={rowId} crudAction="update" entity="timeTrigger" />}
      {/* Share Access */}
      {resourceActions.share && (
        <ResourceUserAccessRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.Trigger}
          resourceName={name}
          disabled={isProd}
        />
      )}
      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />
      {/* Triggers Trigger delete alert dialog  */}
      {resourceActions.delete && <TriggerRowDeleteAction rowId={rowId} />}{" "}
      {/* Remove the resource from the user's shared list (shown for rows not owned by the user) */}
      {accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} disabled={isProd} />
      )}
    </TableCNRowActionsMenu>
  );
};
