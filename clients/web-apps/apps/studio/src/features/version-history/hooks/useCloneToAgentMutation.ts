import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { cloneHistoryToAgent } from "../apis/agents-history-apis";
import { FlowVersionHistoryDetailDto } from "../dtos/agent-history-details-dto";

export const useCloneToAgentMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationKey: ["clone-history"],
    mutationFn: async (detail: FlowVersionHistoryDetailDto) => {
      return cloneHistoryToAgent({ ...detail });
    },

    onSuccess: (data) => {
      toast.success("Agent cloned successfully");
      navigate(`/agent?f=${data.data.flowId}&v=${data.data.flowVersionId}`);
    },
    onError: () => {
      toast.error("Clone failed. Please try again.");
    },
  });
};
