import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getPublishedAgents } from "../apis/agents-table-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch published agents.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchAgents = () => {
  // Get agents using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getPublishedAgents(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
