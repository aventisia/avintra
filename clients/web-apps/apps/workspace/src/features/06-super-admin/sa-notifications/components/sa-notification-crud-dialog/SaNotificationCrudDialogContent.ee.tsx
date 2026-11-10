import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { AudienceScopeEnum } from "@avplatform/ui/enums";
import { RecordSheetLoading } from "@avplatform/ui/record-sheet";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { useQuery } from "@tanstack/react-query";

import { getSaNotification, getSaNotificationRecipients } from "../../apis/sa-notification-apis.ee";
import { SaNotificationComposeForm } from "../SaNotificationComposeForm.ee";
import { SaNotificationView } from "./SaNotificationView.ee";

interface SaNotificationCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

/**
 * Renders the body of the URL-driven Super Admin notification CRUD dialog.
 * - "read" renders the read-only view.
 * - "create" renders the compose form in create mode.
 * - "update" loads the notification and renders the compose form in edit mode.
 */
export const SaNotificationCrudDialogContent = ({
  crudAction,
  rowId,
}: SaNotificationCrudDialogContentProps) => {
  if (crudAction === "read") {
    return <SaNotificationView rowId={rowId} />;
  }

  if (crudAction === "update") {
    return <SaNotificationUpdateForm rowId={rowId} />;
  }

  return <SaNotificationCreateForm />;
};

/**
 * Renders the compose form in create mode and closes the dialog once the
 * notification is successfully created.
 */
const SaNotificationCreateForm = () => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  return <SaNotificationComposeForm onSuccess={onCloseConfirmed} />;
};

/**
 * Loads the notification being edited and renders the compose form in edit mode.
 * Closes the dialog once the update succeeds.
 */
const SaNotificationUpdateForm = ({ rowId }: { rowId: string }) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const { data, isLoading } = useQuery({
    queryKey: ["sa-notification", rowId],
    queryFn: () => getSaNotification(rowId),
  });

  // Load the selected recipient users so the edit form can prefill them.
  const { data: recipientsData } = useQuery({
    queryKey: ["sa-notification-recipients", rowId],
    queryFn: () => getSaNotificationRecipients(rowId),
    enabled: !!data?.data && data.data.audienceScope === AudienceScopeEnum.SelectedUsers,
  });

  if (isLoading || !data?.data) {
    return <RecordSheetLoading label="Loading notification..." />;
  }

  return (
    <SaNotificationComposeForm
      notification={data.data}
      recipients={recipientsData?.data ?? []}
      onSuccess={onCloseConfirmed}
    />
  );
};
