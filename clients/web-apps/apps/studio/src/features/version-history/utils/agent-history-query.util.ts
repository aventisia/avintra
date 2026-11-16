import { QueryClient, queryOptions } from "@tanstack/react-query";

import { getAgentsHistory } from "../apis/agents-history-apis";
import { HISTORY_QUERY_KEY } from "../constants";

export const agentHistoryQueryOptions = (versionId: string) =>
  queryOptions({
    queryKey: [HISTORY_QUERY_KEY, versionId],
    queryFn: () => getAgentsHistory(versionId),
  });

/** Fetches the change history for the version in the URL and counts it; `null` when the URL names no version. */
export const countAgentHistory = async (
  queryClient: QueryClient,
  searchParams: URLSearchParams,
): Promise<number | null> => {
  const versionId = searchParams.get("v") || "";
  if (!versionId) return null;

  const response = await queryClient.fetchQuery(agentHistoryQueryOptions(versionId));
  return response.data?.length ?? 0;
};
