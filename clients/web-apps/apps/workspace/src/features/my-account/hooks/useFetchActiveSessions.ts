import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getActiveSessions } from "../apis/my-account-apis";

/**
 * Custom hook to fetch Active Sessions.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchActiveSessions = () => {
  // Get sessions using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["ACTIVE_SESSIONS"],
    queryFn: () => getActiveSessions(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
