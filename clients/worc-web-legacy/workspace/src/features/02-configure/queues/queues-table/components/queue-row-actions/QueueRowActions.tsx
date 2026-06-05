import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

import { DTRowAction, DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { useTableTab } from "../../hooks/useTableTab";
import { AddTriggerRowAction } from "./AddTriggerRowAction";
import { AssignAgentsRowAction } from "./AssignAgentsRowAction";
import { AssignUsersRowAction } from "./AssignUsersRowAction";
import { OpenQueueRowAction } from "./OpenQueueRowAction";
import { QueueRowDeleteAction } from "./QueueRowDeleteAction";
import { UploadItemsRowAction } from "./UploadItemsRowAction";

interface QueueRowActionsProps {
  rowId: string;
  queueName: string;
  type: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
}

export const QueueRowActions = ({
  rowId,
  queueName,
  type,
  accessLevel,
  isTenantWideAccess,
}: QueueRowActionsProps) => {
  const actions = getResourceAccessActions(accessLevel);

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isShared, queryKey } = useTableTab();

  return (
    // Dropdown menu for Queue table row action */}
    <DataTableRowActions className="w-36 min-w-36">
      {/* View the Queue details */}
      {actions?.read && <OpenQueueRowAction rowId={rowId} />}{" "}
      {/* Edit Queue details */}
      {actions?.update && (
        <DTRowAction rowId={rowId} crudAction="update" />
      )}{" "}
      {actions?.update ? (
        type == "User" ? (
          <AssignUsersRowAction rowId={rowId} queueName={queueName} />
        ) : (
          <AssignAgentsRowAction rowId={rowId} queueName={queueName} />
        )
      ) : null}
      {actions?.update && <AddTriggerRowAction rowId={rowId} />}
      {actions?.update && <UploadItemsRowAction rowId={rowId} />}
      {/* Share Access */}
      {actions?.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.Queue}
          resourceName={queueName}
        />
      )}
      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />
      {/* Triggers Queue delete alert dialog  */}
      {actions?.delete && <QueueRowDeleteAction rowId={rowId} />}
      {isShared && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
