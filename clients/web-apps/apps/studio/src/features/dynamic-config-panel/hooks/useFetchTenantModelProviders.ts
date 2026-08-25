import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@avplatform/ui/stores";

import { getTenantModelProviders } from "../apis/tenant-model-provider-apis";

export const TENANT_MODEL_PROVIDERS_QUERY_KEY = ["tenant-model-providers"] as const;

/**
 * Fetches the list of model providers configured for the current tenant.
 * Returns the raw query result so callers can filter by enabled/disabled status.
 *
 * The query key is scoped by tenant id so that provider/model configs enabled in
 * one tenant never leak into another tenant via the shared React Query cache.
 */
export const useFetchTenantModelProviders = () => {
  const tenantId = useUserSessionStore(
    useShallow((state) => state.userSession?.tenantId ?? ""),
  );

  return useQuery({
    queryKey: [...TENANT_MODEL_PROVIDERS_QUERY_KEY, tenantId],
    queryFn: getTenantModelProviders,
    enabled: Boolean(tenantId),
  });
};
