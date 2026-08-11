import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useShowAlertHandler } from "@avplatform/ui/hooks";

import { useDeleteNotificationMutation } from "../../hooks/useDeleteNotificationMutation.hook";

interface NotificationDeleteActionProps {
  rowId: string;
  /** Whether the delete action is disabled (e.g. for sent notifications). */
  disabled?: boolean;
}

/**
 * Renders the delete action for a notification row.
 * Confirms via alert dialog, then deletes the notification.
 */
export const NotificationDeleteAction = ({ rowId, disabled }: NotificationDeleteActionProps) => {
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const { deleteNotificationMutation } = useDeleteNotificationMutation();

  return (
    <DeleteDDMenuItem
      disabled={disabled}
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () => deleteNotificationMutation(rowId),
          alertType: "delete-record",
          additionalText: "notification",
        });
      }}
    />
  );
};
