import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { NotificationStatusEnum } from "@avplatform/ui/enums";

import { SaNotificationDeleteAction } from "./SaNotificationDeleteAction.ee";

interface SaNotificationRowActionsProps {
  rowId: string;
  status: NotificationStatusEnum;
}

/**
 * Renders the row actions (view, edit, delete) for a Super Admin notification row.
 * View and Edit open the URL-driven CRUD dialog for the saNotification entity.
 * Sent notifications are immutable, so their Edit and Delete actions are disabled.
 */
export const SaNotificationRowActions = ({ rowId, status }: SaNotificationRowActionsProps) => {
  const isSent = status === NotificationStatusEnum.Sent;

  return (
    <DataTableRowActions>
      <DTRowAction rowId={rowId} crudAction="read" entity="saNotification" />
      <DTRowAction rowId={rowId} crudAction="update" entity="saNotification" disabled={isSent} />
      <DropdownMenuSeparator />
      <SaNotificationDeleteAction rowId={rowId} disabled={isSent} />
    </DataTableRowActions>
  );
};
