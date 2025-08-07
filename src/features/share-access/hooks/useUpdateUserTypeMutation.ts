import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFlowUser } from "../apis/share-flow-apis";
import { useLocation } from "react-router-dom";
import { FLOWS_USER_KEY } from "../constants";

export const useUpdateUserTypeMutation = () => {
  // Get query client
  const queryClient = useQueryClient();
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("mid") || "";

  const { isPending, mutate } = useMutation({
    mutationFn: updateFlowUser,
    onSuccess: (httpResponse) => {
      queryClient.invalidateQueries({ queryKey: [FLOWS_USER_KEY, modelId] });

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
