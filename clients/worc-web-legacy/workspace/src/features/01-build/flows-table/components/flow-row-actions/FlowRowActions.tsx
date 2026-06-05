import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

import { DTRowAction, DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { useTableTab } from "../../hooks/useTableTab";
import { FlowRowDeleteAction } from "./FlowRowDeleteAction";
import { FlowRowOpenAction } from "./FlowRowOpenAction";

interface FlowRowActionsProps {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
}

export const FlowRowActions = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
}: FlowRowActionsProps) => {
  const actions = getResourceAccessActions(accessLevel);

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isShared, queryKey } = useTableTab();

  return (
    // Dropdown menu for flow table row action */}
    <DataTableRowActions className="w-36 min-w-36">
      {/* To open flow in studio */}
      <FlowRowOpenAction rowId={rowId} />

      {/* View the flow details */}
      {actions?.read && <DTRowAction rowId={rowId} crudAction="read" />}

      {/* Edit flow details */}
      {actions?.update && <DTRowAction rowId={rowId} crudAction="update" />}

      {/* Share Access */}
      {actions?.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.Flow}
          resourceName={name}
        />
      )}

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Flow delete/remove alert dialog  */}

      {actions?.delete && <FlowRowDeleteAction rowId={rowId} />}

      {isShared && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
