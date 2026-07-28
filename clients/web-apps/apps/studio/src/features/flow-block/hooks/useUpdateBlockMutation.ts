import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFlowBlock } from "../apis/flow-block-apis";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";
import { FLOW_BLOCK_QUERY_KEY } from "../constants";

export const useUpdateBlockMutation = () => {
  // Get query client
  const queryClient = useQueryClient();

  // Get crud dialog store to show dialog state
  const { setShowDialog } = useDTCrudDialogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  const { isPending, mutate } = useMutation({
    mutationFn: updateFlowBlock,
    onSuccess: (httpResponse) => {
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
