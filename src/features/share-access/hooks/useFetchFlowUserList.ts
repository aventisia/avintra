import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { getFlowUser } from "../apis/share-flow-apis";
import { FLOWS_USER_KEY } from "../constants";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchFlowUserList = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("pid") || "";

  // Get flow versions using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: [FLOWS_USER_KEY, modelId],
    queryFn: () => getFlowUser(modelId),
    enabled: !!modelId,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
