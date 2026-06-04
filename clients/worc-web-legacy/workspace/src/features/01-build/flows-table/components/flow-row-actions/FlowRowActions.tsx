import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

import { DTRowAction, DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { AccessTypeEnum } from "../../constants/access-type-enum";
import { FlowRowDeleteAction } from "./FlowRowDeleteAction";
import { FlowRowOpenAction } from "./FlowRowOpenAction";
import { FlowRowRemoveAction } from "./FlowRowRemoveAction";
import { ResourceShareRowAction } from "./ResourceShareRowAction";

interface FlowRowActionsProps {
  rowId: string;
  accessType: AccessTypeEnum;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
}

export const FlowRowActions = ({
  rowId,
  accessType,
  accessLevel,
  isTenantWideAccess,
}: FlowRowActionsProps) => {
  const actions = getResourceAccessActions(accessLevel);

  const showDivider = actions?.share || actions?.delete;

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
        />
      )}

      {/* DropdownMenuSeparator component */}
      {showDivider && <DropdownMenuSeparator />}

      {/* Triggers Flow delete/remove alert dialog  */}

      {accessType !== "Owner" ? (
        actions?.delete ? (
          <FlowRowDeleteAction rowId={rowId} />
        ) : null
      ) : (
        <FlowRowRemoveAction rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
