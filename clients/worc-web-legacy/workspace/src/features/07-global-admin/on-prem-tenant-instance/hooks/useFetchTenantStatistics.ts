import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getTenantStatistics } from "../apis/tenant-instance-apis";

/**
 * Custom hook to fetch OnPremTenants statistics using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTenantStatistics = (id: string) => {
  // Get OnPremTenants statistics using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["TENANT_STATISTICS", id],
    queryFn: () => getTenantStatistics(id),
    enabled: !!id,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
