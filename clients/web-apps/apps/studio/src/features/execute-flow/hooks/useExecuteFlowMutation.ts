import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { executeFlowOnWeb } from "..";

/**
 * Hook to handle flow execution mutation.
 * Handles API call, loading state, and success/error toasts.
 */
export const useExecuteFlowMutation = () => {
  const {
    isPending,
    mutate: executeFlowOnWebMutate,
    mutateAsync: executeFlowOnWebMutationAsync,
  } = useMutation({
    mutationFn: executeFlowOnWeb,

    onSuccess: (httpResponse) => {
      // Success message
      toast.success(
        httpResponse.message || "Flow execution started successfully",
      );
    },
    onError: (error) => {
      toast.error(error.toString() || "Failed to start flow execution");
    },
  });

  return {
    isPending,
    executeFlowOnWebMutate,
    executeFlowOnWebMutationAsync,
  };
};
