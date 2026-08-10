import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { getSearchPublishedAgents } from "@/features/03-orchestrator/agents-table/apis/agents-table-apis";
import { useCurrentSpaceStore } from "@/stores/current-space-store";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchAgentsList = (query: string) => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  return useQuery({
    queryKey: ["agents-list", query, currentSpace?.id],
    queryFn: () => getSearchPublishedAgents(query),

    enabled: !!query,
  });
};
