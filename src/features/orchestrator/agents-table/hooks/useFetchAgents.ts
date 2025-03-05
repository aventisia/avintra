import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { getPublishedAgents } from "../apis/agents-table-apis";
import { useAgentsTableStore } from "../stores/agents-table-store";

/**
 * Custom hook to fetch associated agents.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchAgents = () => {
  // Get agents store state and actions
  const { agentsQueryKey } = useAgentsTableStore(
    useShallow((state) => ({
      agentsQueryKey: state.agentsQueryKey,
    })),
  );

  // Get agents using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: agentsQueryKey,
    queryFn: () => getPublishedAgents(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};