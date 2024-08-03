import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { OnBeforeDelete } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";

export const useConfirmDelete = () => {
  // Get showAlert handler
  const { showAlertDialog } = useShowAlertHandler();

  // Confirm delete handler
  const onBeforeDelete: OnBeforeDelete = useCallback(
    async ({ nodes, edges }) => {
      // Get selected nodes and edges
      const selectedNodes = nodes.filter((node) => node.selected);
      const selectedEdges = edges.filter((edge) => edge.selected);

      // Return if no nodes or edges selected
      if (!selectedNodes.length && !selectedEdges.length) return false;

      // If selected node is a trigger node, return false
      if (selectedNodes.some((node) => node.data?.type === "trigger")) {
        toast.info("Flow trigger cannot be deleted", {
          className: "sonner-toaster-sm",
        });
        return false;
      }

      // Get item or items based on selection
      const itemOrItems =
        selectedNodes.length + selectedEdges.length > 1 ? "items" : "item";

      // Get confirmation from user
      const isConfirmed = await new Promise<boolean>((resolve) => {
        showAlertDialog({
          confirmActionFn: () => resolve(true),
          title: `Delete selected ${itemOrItems}?`,
          description: `This action cannot be undone. Are you sure you want to delete the selected ${itemOrItems}?`,
          confirmBtnText: "Yes, delete",
        });
      });

      // Delete selected nodes and edges if confirmed
      if (isConfirmed) return true;

      // Return false if not confirmed
      return false;
    },
    [showAlertDialog],
  );

  return { onBeforeDelete };
};
