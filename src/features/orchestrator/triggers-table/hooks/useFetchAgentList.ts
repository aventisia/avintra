import { useQuery } from "@tanstack/react-query";

import { getSearchAgent } from "../apis/search-agent-apis";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchAgentList = (query: string) => {
  return useQuery({
    queryKey: ["agents-list", query],
    queryFn: () => getSearchAgent(query),
    enabled: !!query,
  });
};
