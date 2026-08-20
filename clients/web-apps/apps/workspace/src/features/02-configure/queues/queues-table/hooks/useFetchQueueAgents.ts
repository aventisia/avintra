import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getQueueAgents } from "../apis/queue-agents-apis";
import { QUEUE_AGENT_KEY } from "../constants";
import { useEnvironmentStore } from "@/stores/environment-store";

/**
 * Custom hook to fetch queue agents using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchQueueAgents = (queueId: string) => {
  const env = useEnvironmentStore((state) => state.env);
  // Get agents using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [QUEUE_AGENT_KEY, queueId, env],
    queryFn: () => getQueueAgents(queueId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
