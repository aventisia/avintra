import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { cloneHistoryToVersion } from "../apis/agents-history-apis";
import { FlowVersionHistoryDetailDto } from "../dtos/agent-history-details-dto";

export const useCloneToVersionMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationKey: ["clone-history"],
    mutationFn: async (detail: FlowVersionHistoryDetailDto) => {
      return cloneHistoryToVersion({ ...detail });
    },
    onSuccess: (data) => {
      toast.success("Version cloned successfully");
      navigate(`/agent?f=${data.data.flowId}&v=${data.data.flowVersionId}`);
    },
    onError: () => {
      toast.error("Clone failed. Please try again.");
    },
  });
};
