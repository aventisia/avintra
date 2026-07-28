import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFlowBlock } from "../apis/flow-block-apis";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useShallow } from "zustand/react/shallow";
import { useFlowBlockStore } from "../stores/flow-block-store";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { FLOW_BLOCK_QUERY_KEY } from "../constants";

export const useDeleteBlockMutation = () => {
  // Get query client
  const queryClient = useQueryClient();

  const { setNodes, nodes } = useReactFlowExtStore(
    useShallow((state) => ({ setNodes: state.setNodes, nodes: state.nodes })),
  );

  // Get crud dialog store to show dialog state
  const { setShowDialog } = useDTCrudDialogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  const { groupId } = useFlowBlockStore(
    useShallow((state) => ({ groupId: state.groupId })),
  );

  const markGroupHeadAsNotBlock = () => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === groupId && node.data?.isGroupHead) {
        const keysToRemove = ["isBlock", "blockId"];
        return {
          ...node,
          data: Object.fromEntries(
            Object.entries(node.data).filter(
              ([key]) => !keysToRemove.includes(key),
            ),
          ),
        };
      }
      return node;
    });

    setNodes(updatedNodes);
  };

  const { isPending, mutate } = useMutation({
    mutationFn: deleteFlowBlock,
    onSuccess: (httpResponse) => {
      markGroupHeadAsNotBlock();
      queryClient.invalidateQueries({ queryKey: [FLOW_BLOCK_QUERY_KEY] });

      setShowDialog(false);
      // Success message
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
    },

    onError: (error) => {
      markGroupHeadAsNotBlock();

      // Show error toast
      toast.error(error.toString());
    },
  });
  return {
    isPending,
    mutate,
  };
};
