import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getAssignedMachines } from "../apis/agents-table-apis";

/**
 * Custom hook to fetch associated machines.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchMachines = (agentId: string) => {
  // Get agents using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["machines-to-select", agentId],
    queryFn: () => getAssignedMachines(agentId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
