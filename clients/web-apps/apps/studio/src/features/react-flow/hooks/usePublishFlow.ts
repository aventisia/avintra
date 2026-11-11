import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { FlowActionType } from "@/features/collaboration/dtos/collaboration-dtos";
import { useCollaborationStore } from "@/features/collaboration/stores/collaboration-store";
import { DATA_QUERY_KEY } from "@/features/flow-versions/constants";

import { publishFlow } from "../apis/react-flow-apis";

export const usePublishFlowMutation = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  // Get flow id and version id from url
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
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
      // IMPORTANT NOTE: the axios interceptor toasts responses itself, except 400/409/429, which reject with the plain message.
      if (typeof error === "string") toast.error(error);
      else if (!isAxiosError(error) || !error.response) toast.error(error.message);
    },
  });

  // Collaboration guard: expose whether another user holds a publish lock.
  const flowActionLocks = useCollaborationStore((state) => state.flowActionLocks);
  const publishLocked = versionId
    ? !!flowActionLocks[`${versionId}:${FlowActionType.Publish}`]
    : false;

  return {
    isPending,
    mutate,
    publishLocked,
  };
};
