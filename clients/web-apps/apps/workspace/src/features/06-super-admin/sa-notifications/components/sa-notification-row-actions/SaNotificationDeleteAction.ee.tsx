import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useShowAlertHandler } from "@avplatform/ui/hooks";

import { useDeleteSaNotificationMutation } from "../../hooks/useDeleteSaNotificationMutation.hook.ee";

interface SaNotificationDeleteActionProps {
  rowId: string;
  /** Whether the delete action is disabled (e.g. for sent notifications). */
  disabled?: boolean;
}

/**
 * Renders the delete action for a Super Admin notification row.
 * Confirms via alert dialog, then deletes the notification.
 */
export const SaNotificationDeleteAction = ({
  rowId,
  disabled,
}: SaNotificationDeleteActionProps) => {
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const { deleteSaNotificationMutation } = useDeleteSaNotificationMutation();

  return (
    <DeleteDDMenuItem
      disabled={disabled}
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () => deleteSaNotificationMutation(rowId),
          alertType: "delete-record",
          additionalText: "notification",
        });
      }}
    />
  );
};
