import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getSearchAgent } from "../apis/search-agent-apis";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchAgentList = (query: string) => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  return useQuery({
    queryKey: ["agents-list", query, currentSpace?.id],
    queryFn: () => getSearchAgent(query),
    enabled: !!query,
  });
};
