import { useEffect } from "react";
import { toast } from "sonner";

import { useQuery } from "@tanstack/react-query";

import { getTenantsToSelect } from "../apis/tenants";

/**
 * Custom hook to fetch tenants to select using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTenantsToSelect = () => {
  // Get licenses using react query
  const { data, isFetching, refetch, isLoading, isError, error } = useQuery({
    queryKey: ["tenants-to-select"],
    queryFn: () => getTenantsToSelect(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, refetch, isLoading };
};
