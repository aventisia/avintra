import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertFlowBlock } from "../apis/flow-block-apis";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useShallow } from "zustand/react/shallow";
import { useFlowBlockStore } from "../stores/flow-block-store";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { FLOW_BLOCK_QUERY_KEY } from "../constants";

export const useInsertBlockMutation = () => {
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

  const markGroupHeadAsBlock = (blockId: string) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === groupId && node.data?.isGroupHead) {
        return {
          ...node,
          data: {
            ...node.data,
            isBlock: true,
            blockId,
          },
        };
      }
      return node;
    });

    setNodes(updatedNodes);
  };

  const { isPending, mutate } = useMutation({
    mutationFn: insertFlowBlock,
    onSuccess: (httpResponse) => {
      markGroupHeadAsBlock(httpResponse.data.id);
      setShowDialog(false);
      queryClient.invalidateQueries({ queryKey: [FLOW_BLOCK_QUERY_KEY] });

      // Success message
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
    },

    onError: (error) => {
      // Show error toast
      toast.error(error.toString());
    },
  });
  return {
    isPending,
    mutate,
  };
};
