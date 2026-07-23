import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getOnPremTenants } from "../apis/on-prem-tenant-apis";
import { ON_PREM_TENANT_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch OnPremTenants using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchOnPremTenants = () => {
  // Get OnPremTenants using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ON_PREM_TENANT_QUERY_KEY,
    queryFn: () => getOnPremTenants(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
