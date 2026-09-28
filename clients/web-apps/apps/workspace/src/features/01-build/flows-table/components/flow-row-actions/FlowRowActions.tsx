import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

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

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  return (
    // Dropdown menu for flow table row action */}
    <DataTableRowActions className="w-36 min-w-36">
      {/* To open flow in studio */}
      <FlowRowOpenAction rowId={rowId} />

      {/* View the flow details */}
      {actions?.read && <DTRowAction rowId={rowId} crudAction="read" entity="flow" />}

      {/* Edit flow details */}
      {actions?.update && <DTRowAction rowId={rowId} crudAction="update" entity="flow" />}

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

      {/* Remove the resource from the user's shared list (shown for rows not owned by the user) */}
      {accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
