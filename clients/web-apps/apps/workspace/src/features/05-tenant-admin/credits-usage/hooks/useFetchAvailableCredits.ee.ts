import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getAvailableCredits } from "../apis/credit-usage-apis.ee";
import { AC_QUERY_KEY } from "../constants";

/**
 * Custom React hook to fetch available credits using React Query.
 *
 * This hook retrieves the user's available credits from the server,
 * manages loading and fetching states, and provides a refetch function.
 * If an error occurs during fetching, a toast notification is displayed.
 *
 * @returns An object containing:
 * - `data`: The available credits data (or undefined if not loaded).
 * - `isFetching`: Boolean indicating if a fetch is in progress.
 * - `isLoading`: Boolean indicating if the data is loading for the first time.
 * - `refetch`: Function to manually refetch the available credits.
 */
export const useFetchAvailableCredits = () => {
  // Get available credits using react query
  const { data, isFetching, isLoading, refetch, isError, error } = useQuery({
    queryKey: AC_QUERY_KEY,
    queryFn: getAvailableCredits,
    refetchInterval: 60000, // refetch every 60 seconds
    staleTime: 60000, // data is fresh for 60 seconds
    refetchOnWindowFocus: true, // refetch when window is focused
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return the available credits data
  return { data, isFetching, isLoading, refetch };
};
