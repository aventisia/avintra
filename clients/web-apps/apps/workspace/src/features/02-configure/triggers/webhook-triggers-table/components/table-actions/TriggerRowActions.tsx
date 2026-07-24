import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

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
  const actions = getResourceAccessActions(accessLevel);

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isShared, queryKey } = useTableTab();

  return (
    // Dropdown menu for Trigger table row action */}
    <DataTableRowActions className="w-36 min-w-36">
      {/* View the Trigger details */}
      {actions?.read && <DTRowAction rowId={rowId} crudAction="read" entity="webhookTrigger" />}
      {/* Edit Trigger details */}
      {actions?.update && <DTRowAction rowId={rowId} crudAction="update" entity="webhookTrigger" />}
      {/* Share Access */}
      {actions?.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.Trigger}
          resourceName={name}
        />
      )}
      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />
      {/* Triggers Trigger delete alert dialog  */}
      {actions?.delete && <TriggerRowDeleteAction rowId={rowId} />}{" "}
      {isShared && <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />}
    </DataTableRowActions>
  );
};
