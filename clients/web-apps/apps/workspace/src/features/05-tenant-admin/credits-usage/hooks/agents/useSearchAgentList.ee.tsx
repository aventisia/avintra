import { useQuery } from "@tanstack/react-query";

import { getSearchAgent } from "../../apis/export-service-apis.ee";

/**
 * Custom hook to fetch agents list using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchAgentList = (query: string) => {
  return useQuery({
    queryKey: ["agent-list", query],
    queryFn: () => getSearchAgent(query),
    enabled: !!query,
  });
};
