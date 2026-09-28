import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

import { useTableTab } from "../../hooks/useTableTab.hook";
import { ToolRowDeleteAction } from "./ToolRowDeleteAction";

interface ToolRowActionsProps {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
  isLibrary?: boolean;
}

export const ToolRowActions = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
  isLibrary = false,
}: ToolRowActionsProps) => {
  const actions = getResourceAccessActions(accessLevel);
  // Get the query key used to invalidate the merged tools list after a mutation
  const { queryKey } = useTableTab();

  return (
    <DataTableRowActions className="w-36 min-w-36">
      {/* View the tool details */}
      {<DTRowAction rowId={rowId} crudAction="read" entity="tool" />}

      {/* Edit tool details (not available for library tools) */}
      {!isLibrary && actions?.update && (
        <DTRowAction rowId={rowId} crudAction="update" entity="tool" />
      )}

      {/* Share Access (not available for library tools) */}
      {!isLibrary && actions?.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.Tool}
          resourceName={name}
        />
      )}

      <DropdownMenuSeparator />

      {/* Delete tool (not available for library tools) */}
      {!isLibrary && actions?.delete && <ToolRowDeleteAction rowId={rowId} />}

      {/* Remove the resource from the user's shared list (shown for rows not owned by the user) */}
      {!isLibrary && accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
