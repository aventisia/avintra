import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { deleteFlowVersion } from "../apis/flow-version-apis";
import { DATA_QUERY_KEY } from "../constants";

export const useDeleteFlowVersionMutation = () => {
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const flowId = queryParams.get("f");
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: deleteFlowVersion,
    onSuccess: (httpResponse) => {
      // Only if you absolutely need immediate refetch regardless of component state
      queryClient.refetchQueries({ queryKey: [...DATA_QUERY_KEY, flowId] });

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
