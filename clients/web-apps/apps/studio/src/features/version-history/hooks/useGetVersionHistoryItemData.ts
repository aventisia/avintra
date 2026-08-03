import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { FlowVersionHistoryDto } from "@/features/version-history/dtos/agent-history-dto";

export const useGetVersionHistoryItemData = (id: string) => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const currVersionId = searchParams.get("v") || "";

  const agentsData = queryClient.getQueryData<{
    data: FlowVersionHistoryDto[];
  }>(["AGENT_HISTORY", currVersionId]);

  const agentData = agentsData?.data.find((item) => item.id === id);

  return {
    agentData,
    currVersionId,
  };
};
