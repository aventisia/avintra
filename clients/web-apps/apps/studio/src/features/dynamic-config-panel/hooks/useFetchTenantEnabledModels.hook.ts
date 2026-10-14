import { ModelCapabilityEnum } from "@avplatform/ui/enums";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { getEnabledModels } from "../apis/tenant-model-provider-apis";

export const TENANT_ENABLED_MODELS_QUERY_KEY = ["tenant-enabled-models"] as const;

/**
 * Fetches the tenant's enabled models filtered by the given model capability when enabled; the query key is scoped by tenant and capability.
 */
export const useFetchTenantEnabledModels = (capability: ModelCapabilityEnum, enabled = true) => {
  const tenantId = useUserSessionStore(useShallow((state) => state.userSession?.tenantId ?? ""));

  return useQuery({
    queryKey: [...TENANT_ENABLED_MODELS_QUERY_KEY, tenantId, capability],
    queryFn: () => getEnabledModels(capability),
    enabled: Boolean(tenantId) && enabled,
  });
};
