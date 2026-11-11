import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { updateFlowSilently } from "@/features/react-flow/apis/react-flow-apis";

import { FlowVersionHistoryDetailDto } from "../dtos/agent-history-details-dto";

export const useRestoreAgentVersion = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const currVersionId = searchParams.get("v") || "";

  return useMutation({
    mutationFn: async (detail: FlowVersionHistoryDetailDto) => {
      return updateFlowSilently({
        id: detail.flowId,
        versionId: detail.flowVersionId,
        reactFlowObject: detail.reactFlowObject ?? JSON.stringify([]),
        flowVariablesObject: detail.flowVariablesObject ?? JSON.stringify([]),
        inputOutputObject: detail.inputOutputObject ?? JSON.stringify([]),
      });
    },
    onSuccess: (_, detail) => {
      queryClient.invalidateQueries({
        queryKey: ["AGENT_HISTORY", currVersionId],
      });
      // IMPORTANT NOTE: drop the cached Agent so closing history refetches the
      // restored content (the loader query never refetches on mount).
      queryClient.removeQueries({ queryKey: ["flow", detail.flowId] });

      toast.success("Change restored successfully");
    },
  });
};
