import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { getStudioSpaceId } from "@/utils/space-headers";

import {
  getPersonalTools,
  getUsableToolCatalog,
  getUsableToolOperations,
  getUsableTools,
} from "../apis/tools-apis";

export const USABLE_TOOLS_QUERY_KEY = ["usable-tools"] as const;
export const USABLE_TOOL_OPERATIONS_QUERY_KEY = ["usable-tool-operations"] as const;
export const PERSONAL_TOOLS_QUERY_KEY = ["personal-tools"] as const;
export const USABLE_TOOL_CATALOG_QUERY_KEY = ["usable-tool-catalog"] as const;

/**
 * Fetches the tools the current user can use (platform, personal, shared and tenant-wide).
 * Scoped by tenant id and space id so configs from one tenant/space never leak via the shared cache.
 */
export const useUsableTools = () => {
  const tenantId = useUserSessionStore(useShallow((state) => state.userSession?.tenantId ?? ""));

  return useQuery({
    queryKey: [...USABLE_TOOLS_QUERY_KEY, tenantId, getStudioSpaceId()],
    queryFn: getUsableTools,
    enabled: Boolean(tenantId),
  });
};

/**
 * Fetches the personal tools owned by the current user in the current environment.
 * Used by the flow-builder Custom Tools directory (L2 pane).
 */
export const usePersonalTools = () => {
  const tenantId = useUserSessionStore(useShallow((state) => state.userSession?.tenantId ?? ""));

  return useQuery({
    queryKey: [...PERSONAL_TOOLS_QUERY_KEY, tenantId, getStudioSpaceId()],
    queryFn: getPersonalTools,
    enabled: Boolean(tenantId),
  });
};

/**
 * Fetches the usable tools together with their operations in one payload
 * (`GET /tools/usable/catalog`). Used by the flow-builder Custom Tools panel:
 * L2 lists the tools and L3 renders each tool's operations without a second
 * round-trip. `options.enabled` lets callers gate the fetch (e.g. until the
 * flow finishes loading); defaults to enabled as soon as the session resolves.
 */
export const useUsableToolCatalog = (options?: { enabled?: boolean }) => {
  const tenantId = useUserSessionStore(useShallow((state) => state.userSession?.tenantId ?? ""));

  return useQuery({
    queryKey: [...USABLE_TOOL_CATALOG_QUERY_KEY, tenantId, getStudioSpaceId()],
    queryFn: getUsableToolCatalog,
    enabled: Boolean(tenantId) && (options?.enabled ?? true),
  });
};

/**
 * Fetches the operations exposed by a single usable tool, together with the credential
 * type required to invoke it.
 */
export const useUsableToolOperations = (toolId?: string) => {
  const tenantId = useUserSessionStore(useShallow((state) => state.userSession?.tenantId ?? ""));

  return useQuery({
    queryKey: [...USABLE_TOOL_OPERATIONS_QUERY_KEY, toolId, tenantId, getStudioSpaceId()],
    queryFn: () => getUsableToolOperations(toolId as string),
    enabled: Boolean(tenantId && toolId),
  });
};
