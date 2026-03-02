import { useQuery } from "@tanstack/react-query";
import { getAgentsHistoryById } from "../apis/agents-history-apis";

export const useFetchVersionHistoryDetail = (id: string) => {
  return useQuery({
    queryKey: ["AGENT_HISTORY_DETAIL", id],
    queryFn: () => getAgentsHistoryById(id),
    enabled: false,
    select: (res) => res.data,
  });
};
