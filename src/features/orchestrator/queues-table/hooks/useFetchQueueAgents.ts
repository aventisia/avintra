import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getQueueAgents } from "../apis/queue-agents-apis";
import { QUEUE_AGENT_KEY } from "../constants";

/**
 * Custom hook to fetch queue agents using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchQueueAgents = (queueId: string) => {
  // Get agents using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [QUEUE_AGENT_KEY, queueId],
    queryFn: () => getQueueAgents(queueId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
