import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "@aventisia/ui/sonner";
import { DATA_QUERY_KEY } from "../constants";
import { getFlowLogs } from "../apis/flow-logs-apis";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to fetch flow logs using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchFlowLogs = () => {
  // Get the current location
  const location = useLocation();

  // Create an instance of URLSearchParams
  const queryParams = new URLSearchParams(location.search);

  // Access flowId query parameters
  const flowId = queryParams.get("f");

  // Get flow logs using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getFlowLogs(flowId || ""),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
