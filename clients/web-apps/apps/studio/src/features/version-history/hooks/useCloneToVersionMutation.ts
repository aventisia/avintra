import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { cloneHistoryToVersion } from "../apis/agents-history-apis";
import { FlowVersionHistoryDetailDto } from "../dtos/agent-history-details-dto";

export const useCloneToVersionMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (detail: FlowVersionHistoryDetailDto) => {
      return cloneHistoryToVersion({ ...detail });
    },
    onSuccess: (data) => {
      navigate(`/agent?f=${data.data.flowId}&v=${data.data.flowVersionId}`);
    },
  });
};
