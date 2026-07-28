import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFlowSilently } from "@/features/react-flow/apis/react-flow-apis";
import { toast } from "@avplatform/ui/sonner";
import { useSearchParams } from "react-router-dom";
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["AGENT_HISTORY", currVersionId],
      });

      toast.success("Change restored successfully");
    },
  });
};
