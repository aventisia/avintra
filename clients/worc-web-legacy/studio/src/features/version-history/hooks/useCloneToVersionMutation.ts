import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FlowVersionHistoryDetailDto } from "../dtos/agent-history-details-dto";
import { cloneHistoryToVersion } from "../apis/agents-history-apis";

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
