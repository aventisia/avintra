import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getTenantInstanceStatistics } from "../apis/tenant-instance-data-apis";

/**
 * Custom hook to fetch OnPremTenants instance statistics using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTenantInstanceStatistics = (id: string) => {
  // Get OnPremTenants instance statistics using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["INSTANCE_STATISTICS", id],
    queryFn: () => getTenantInstanceStatistics(id),
    enabled: !!id,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
