import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getApiKeys } from "../apis/api-key.apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch API keys using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchApiKeys = () => {
  // Get API keys using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [...DATA_QUERY_KEY],
    queryFn: () => getApiKeys(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
