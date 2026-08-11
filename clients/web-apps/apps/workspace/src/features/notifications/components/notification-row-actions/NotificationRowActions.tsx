import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { NotificationStatusEnum } from "@avplatform/ui/enums";

import { NotificationDeleteAction } from "./NotificationDeleteAction";

interface NotificationRowActionsProps {
  rowId: string;
  status: NotificationStatusEnum;
}

/**
 * Renders the row actions (view, edit, delete) for a notification row.
 * View and Edit open the URL-driven CRUD dialog for the notification entity.
 * Sent notifications are immutable, so their Edit and Delete actions are disabled.
 */
export const NotificationRowActions = ({ rowId, status }: NotificationRowActionsProps) => {
  const isSent = status === NotificationStatusEnum.Sent;

  return (
    <DataTableRowActions>
      <DTRowAction rowId={rowId} crudAction="read" entity="notification" />
      <DTRowAction rowId={rowId} crudAction="update" entity="notification" disabled={isSent} />
      <DropdownMenuSeparator />
      <NotificationDeleteAction rowId={rowId} disabled={isSent} />
    </DataTableRowActions>
  );
};
