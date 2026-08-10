import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getUserSpaces } from "../apis/users-table-apis";

/**
 * Custom hook to fetch the spaces available for the current tenant.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchUserSpaces = () => {
  // Get spaces using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["spaces-to-select"],
    queryFn: () => getUserSpaces(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
