import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getFlows } from "../apis/flows-table-apis";
import { FLOWS_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch flows using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchFlows = () => {
  // Get flows using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: FLOWS_QUERY_KEY,
    queryFn: () => getFlows(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
