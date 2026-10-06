import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useShowAlertHandler } from "@avplatform/ui/hooks";

import { useDeleteFlowVersionMutation } from "../../hooks/useDeleteFlowVersion";

interface FVIDeleteActionProps {
  versionId: string;
  versionNumber: number | null;
}

/**
 * Renders the delete action for a flow list item.
 * This component displays a dropdown menu item with a delete button.
 */
export const FVIDeleteAction = ({ versionId, versionNumber }: FVIDeleteActionProps) => {
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { mutateAsync: deleteVersion } = useDeleteFlowVersionMutation();
  const versionLabel = versionNumber != null ? `Version ${versionNumber}` : "this version";

  return (
    <DeleteDDMenuItem
      size="sm"
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () => deleteVersion(versionId),
          isDestructive: true,
          title: `Delete ${versionLabel}?`,
          description:
            "This action cannot be undone. Are you sure you want to delete this version?",
          confirmBtnText: `Yes, delete ${versionLabel}`,
          showLoadingOnConfirm: true,
        });
      }}
    />
  );
};
