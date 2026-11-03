import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { AudienceScopeEnum } from "@avplatform/ui/enums";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { useQuery } from "@tanstack/react-query";

import { getNotification, getNotificationRecipients } from "../../apis/notification-apis";
import { NotificationComposeForm } from "../NotificationComposeForm";
import { NotificationView } from "./NotificationView";

interface NotificationCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

/**
 * Renders the body of the URL-driven notification CRUD dialog.
 * - "read" renders the read-only view.
 * - "create" renders the compose form in create mode.
 * - "update" loads the notification and renders the compose form in edit mode.
 */
export const NotificationCrudDialogContent = ({
  crudAction,
  rowId,
}: NotificationCrudDialogContentProps) => {
  if (crudAction === "read") {
    return <NotificationView rowId={rowId} />;
  }

  if (crudAction === "update") {
    return <NotificationUpdateForm rowId={rowId} />;
  }

  return <NotificationComposeForm />;
};

/**
 * Loads the notification being edited and renders the compose form in edit mode.
 * Closes the dialog once the update succeeds.
 */
const NotificationUpdateForm = ({ rowId }: { rowId: string }) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const { data, isLoading } = useQuery({
    queryKey: ["notification", rowId],
    queryFn: () => getNotification(rowId),
  });

  // Load the selected recipient users so the edit form can prefill them.
  const { data: recipientsData } = useQuery({
    queryKey: ["notification-recipients", rowId],
    queryFn: () => getNotificationRecipients(rowId),
    enabled: !!data?.data && data.data.audienceScope === AudienceScopeEnum.SelectedUsers,
  });

  if (isLoading || !data?.data) {
    return <div className="px-4 pb-5 text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <NotificationComposeForm
      notification={data.data}
      recipients={recipientsData?.data ?? []}
      onSuccess={onCloseConfirmed}
    />
  );
};
