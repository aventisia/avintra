import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getTenantPublishedAgents } from "../apis/tenants-table-apis.ee";

export const TENANT_PUBLISHED_AGENTS_QUERY_KEY = ["tenant-published-agents"];

/**
 * Custom hook to fetch the published agents for a specific tenant.
 * @param tenantId The tenant ID to fetch published agents for.
 * @returns An object containing the fetched data and loading flags.
 */
export const useFetchTenantPublishedAgents = (tenantId: string) => {
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [...TENANT_PUBLISHED_AGENTS_QUERY_KEY, tenantId],
    queryFn: () => getTenantPublishedAgents(tenantId),
    enabled: !!tenantId,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading };
};
