import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFlowUser } from "../apis/share-flow-apis";
import { useSearchParams } from "react-router-dom";
import { FLOWS_USER_KEY } from "../constants";

export const useUpdateUserTypeMutation = () => {
  // Get query client
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const flowId = searchParams.get("f") || "";

  const { isPending, mutate } = useMutation({
    mutationFn: updateFlowUser,
    onSuccess: (httpResponse) => {
      queryClient.invalidateQueries({ queryKey: [FLOWS_USER_KEY, flowId] });

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
