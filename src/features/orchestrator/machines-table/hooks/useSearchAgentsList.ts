import { useQuery } from "@tanstack/react-query";

import { getSearchPublishedAgents } from "../../agents-table/apis/agents-table-apis";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchAgentsList = (query: string) => {
  return useQuery({
    queryKey: ["agents-list", query],
    queryFn: () => getSearchPublishedAgents(query),

    enabled: !!query,
  });
};
