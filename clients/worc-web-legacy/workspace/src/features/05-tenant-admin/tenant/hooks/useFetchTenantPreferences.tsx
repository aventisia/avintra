import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getTenantPreferences } from "../apis/tenant-info-apis";

/**
 * Custom hook to fetch Tenant Preferences using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTenantPreferences = () => {
  // Get Tenant Preferences using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["TENANT_PREFERENCES"],
    queryFn: getTenantPreferences,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
