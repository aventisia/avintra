import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { geTriggerAgents } from "../apis/triggers-table-apis";
import { useEnvironmentStore } from "@/stores/environment-store";

/**
 * Custom hook to fetch agents using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTriggerAgents = (id: string) => {
  const env = useEnvironmentStore((state) => state.env);
  // Get agents using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["select-trigger-agent", id, env],
    queryFn: () => geTriggerAgents(id),
    enabled: !!id,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
