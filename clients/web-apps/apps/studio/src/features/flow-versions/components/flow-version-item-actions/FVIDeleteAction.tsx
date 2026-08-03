import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useShowAlertHandler } from "@avplatform/ui/hooks";

import { useDeleteFlowVersionMutation } from "../../hooks/useDeleteFlowVersion";

interface FVIDeleteActionProps {
  versionId: string;
}

/**
 * Renders the delete action for a flow list item.
 * This component displays a dropdown menu item with a delete button.
 */
export const FVIDeleteAction = ({ versionId }: FVIDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const { mutate: deleteVersion } = useDeleteFlowVersionMutation();
  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      size="sm"
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () => deleteVersion(versionId),
          alertType: "delete-record",
          additionalText: "Flow version",
        });
      }}
    />
  );
};
