import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { getFlowUser } from "../apis/share-flow-apis";
import { FLOWS_USER_KEY } from "../constants";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchFlowUserList = () => {
  const [searchParams] = useSearchParams();

  const flowId = searchParams.get("f") || "";

  // Get flow versions using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: [FLOWS_USER_KEY, flowId],
    queryFn: () => getFlowUser(flowId),
    enabled: !!flowId,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
