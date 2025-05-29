import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "@aventisia/ui/sonner";
import { getFlowVersions } from "../apis/flow-version-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch flow logs using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchFlowVersions = (flowId: string) => {
  // Get flow versions using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getFlowVersions(flowId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
