import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeFlowAccess } from "../apis/flow-user-apis";
import { FLOWS_QUERY_KEY } from "../constants";

export const useRemoveFlowAccessMutation = () => {
  // Get query client
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: removeFlowAccess,
    onSuccess: (httpResponse) => {
      queryClient.invalidateQueries({ queryKey: FLOWS_QUERY_KEY });

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
