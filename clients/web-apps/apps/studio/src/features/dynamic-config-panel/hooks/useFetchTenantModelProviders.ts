import { useQuery } from "@tanstack/react-query";

import { getTenantModelProviders } from "../apis/tenant-model-provider-apis";

export const TENANT_MODEL_PROVIDERS_QUERY_KEY = ["tenant-model-providers"] as const;

/**
 * Fetches the list of model providers configured for the current tenant.
 * Returns the raw query result so callers can filter by enabled/disabled status.
 */
export const useFetchTenantModelProviders = () => {
  return useQuery({
    queryKey: TENANT_MODEL_PROVIDERS_QUERY_KEY,
    queryFn: getTenantModelProviders,
  });
};
