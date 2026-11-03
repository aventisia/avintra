import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { RemoveResourceRowAction } from "@/features/resource-user-access/components/common-row-actions/RemoveResourceRowAction";
import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";
import { getResourceAccessActions } from "@/features/resource-user-access/utils/resource-access-actions";

import { FLOWS_QUERY_KEY } from "../../constants";
import { FlowRowDeleteAction } from "./FlowRowDeleteAction";
import { FlowRowExportAction } from "./FlowRowExportAction";
import { FlowRowMoveToFolderAction } from "./FlowRowMoveToFolderAction";
import { FlowRowOpenAction } from "./FlowRowOpenAction";
import { FlowRowRemoveFromFolderAction } from "./FlowRowRemoveFromFolderAction";

export type FlowRowActionsProps = {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
  folderId?: string | null;
};

/**
 * Menu items of an agent's actions menu, shared by the table row and the grid card.
 */
export const FlowRowActionItems = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
  folderId,
}: FlowRowActionsProps) => {
  const actions = getResourceAccessActions(accessLevel);

  return (
    <>
      <FlowRowOpenAction rowId={rowId} />
      {actions?.read && <FlowRowExportAction rowId={rowId} />}
      {actions?.read && <CrudRowAction rowId={rowId} crudAction="read" entity="flow" />}
      {actions?.update && <CrudRowAction rowId={rowId} crudAction="update" entity="flow" />}
      {actions?.update && (
        <FlowRowMoveToFolderAction rowId={rowId} name={name} folderId={folderId} />
      )}
      {actions?.update && folderId && <FlowRowRemoveFromFolderAction rowId={rowId} name={name} />}
      {actions?.share && (
        <ResourceUserAccessRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.Flow}
          resourceName={name}
        />
      )}
      <DropdownMenuSeparator />
      {actions?.delete && <FlowRowDeleteAction rowId={rowId} />}
      {accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={FLOWS_QUERY_KEY} rowId={rowId} />
      )}
    </>
  );
};
