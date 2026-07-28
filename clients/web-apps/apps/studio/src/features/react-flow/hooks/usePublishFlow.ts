import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishFlow } from "../apis/react-flow-apis";
import { DATA_QUERY_KEY } from "@/features/flow-versions/constants";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export const usePublishFlowMutation = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  // Get flow id and version id from url
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const flowId = queryParams.get("f");
  const versionId = queryParams.get("v") || undefined;

  const { isPending, mutate } = useMutation({
    mutationFn: publishFlow,
    onSuccess: (httpResponse) => {
      // Success message
      queryClient.refetchQueries({ queryKey: DATA_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: ["flow", flowId, versionId] });
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
