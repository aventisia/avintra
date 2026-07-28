import { useMutation } from "@tanstack/react-query";

import { cloneHistoryToVersion } from "../apis/agents-history-apis";
import { FlowVersionHistoryDetailDto } from "../dtos/agent-history-details-dto";

export const useCloneToVersionMutation = () => {
  return useMutation({
    mutationFn: async (detail: FlowVersionHistoryDetailDto) => {
      return cloneHistoryToVersion({ ...detail });
    },
    onSuccess: (data) => {
      window.location.href = `${import.meta.env.VITE_STUDIO_PATH}agent?f=${data.data.flowId}&v=${data.data.flowVersionId}`;
    },
  });
};
