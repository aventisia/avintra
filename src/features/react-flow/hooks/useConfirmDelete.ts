import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { OnBeforeDelete } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

export const useConfirmDelete = () => {
  // Get Studio Preferences store state
  const { deleteAlert } = useStudioPreferencesStore(
    useShallow((state) => ({
      deleteAlert: state.studioPreferences.deleteAlert,
    })),
  );

  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Confirm delete handler
  const onBeforeDelete: OnBeforeDelete = useCallback(
    async ({ nodes, edges }) => {
      // Return true if delete alert is disabled
      if (!deleteAlert) return true;

      // Get selected & deletable nodes and edges
      const selectedNodes = nodes.filter(
        (node) => node.selected && node.deletable,
      );
      const selectedEdges = edges.filter(
        (edge) => edge.selected && edge.deletable,
      );

      // Return if no nodes or edges found
      if (selectedNodes.length + selectedEdges.length === 0) return false;

      // Get confirmation from user
      const isConfirmed = await new Promise<boolean>((resolve) => {
        if (selectedNodes.length + selectedEdges.length === 1) {
          showDefaultAlertDialog({
            confirmActionFn: () => resolve(true),
            alertType: "delete",
          });
        } else {
          showDefaultAlertDialog({
            confirmActionFn: () => resolve(true),
            alertType: "delete-multiple",
            additionalText: `${selectedNodes.length + selectedEdges.length} items`,
          });
        }
      });

      // Delete nodes and edges if confirmed
      if (isConfirmed) return true;

      // Return false if not confirmed
      return false;
    },
    [deleteAlert, showDefaultAlertDialog],
  );

  return { onBeforeDelete };
};
