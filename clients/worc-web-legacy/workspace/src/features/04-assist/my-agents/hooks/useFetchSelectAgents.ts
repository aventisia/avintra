import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getMachineAgents } from "../apis/agents-assist-apis";

/**
 * Custom hook to fetch agents using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSelectTableAgents = (machineId: string) => {
  // Get agents using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["agents-assist", machineId],
    queryFn: () => getMachineAgents(machineId),
    enabled: !!machineId,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
