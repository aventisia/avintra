import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getTenantInstances } from "../apis/tenant-instance-apis";
import { TENANT_INSTANCE_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch OnPremTenantInstances using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTenantInstances = (id: string) => {
  // Get OnPremTenantInstances using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [TENANT_INSTANCE_QUERY_KEY, id],
    queryFn: () => getTenantInstances(id),
    enabled: !!id,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
