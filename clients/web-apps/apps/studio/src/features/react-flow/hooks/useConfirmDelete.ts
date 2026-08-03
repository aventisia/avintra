import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { OnBeforeDelete } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";

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
      // Get selected & deletable nodes and edges
      const selectedNodes = nodes.filter((node) => node.selected && node.deletable);
      const selectedEdges = edges.filter((edge) => edge.selected && edge.deletable);

      // Return if no nodes or edges found
      if (selectedNodes.length + selectedEdges.length === 0) return false;

      const parentNode = nodes.find(
        (n) =>
          n.type === "conditionalNode" &&
          n.data?.mergeBranchesNodeId === selectedNodes[0]?.data?.mergeBranchesNodeId,
      );

      const branches: string[] = (parentNode?.data?.branches ?? []) as string[];

      if (branches.length <= 2 && selectedNodes[0]?.type == "branchNode1") {
        toast.info("At least two branches are required.");

        return false;
      }

      // Return true if delete alert is disabled
      if (!deleteAlert) return true;

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
