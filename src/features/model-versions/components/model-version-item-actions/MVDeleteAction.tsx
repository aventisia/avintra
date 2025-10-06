import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useShowAlertHandler } from "@aventisia/ui/hooks";

import { useDeleteMLModelVersionMutation } from "../../hooks/useDeleteMLModelVersionMutation";

interface MVDeleteActionProps {
  versionId: string;
}

/**
 * Renders the delete action for a version.
 * This component displays a dropdown menu item with a delete button.
 */
export const MVDeleteAction = ({ versionId }: MVDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const { mutate: deleteVersion } = useDeleteMLModelVersionMutation();
  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      size="sm"
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () => deleteVersion(versionId),
          alertType: "delete-record",
          additionalText: "version",
        });
      }}
    />
  );
};
