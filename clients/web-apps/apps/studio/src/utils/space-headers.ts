import { useUserSessionStore } from "@avplatform/ui/stores";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

/**
 * Resolves the space id for the currently loaded flow.
 *
 * Priority:
 * 1. The currently opened flow's `spaceId` (resolved from the flow itself, so
 *    it is correct even in dev where studio and workspace are separate origins).
 * 2. The space persisted by the workspace app in localStorage under
 *    `current-space:<userEmail>` (used when no flow is loaded).
 *
 * Returns an empty string when no space is selected (Central).
 */
const resolveStudioSpaceId = (): string => {
  // 1. Prefer the currently loaded flow's space.
  const flowSpaceId = useCurrentFlowStore.getState().currentFlow?.spaceId;
  if (flowSpaceId) return flowSpaceId;

  // 2. Fall back to the workspace-persisted space in localStorage.
  try {
    const userEmail = useUserSessionStore.getState().userSession?.email ?? "anonymous";
    const raw = localStorage.getItem(`current-space:${userEmail}`);
    if (!raw) return "";

    const parsed = JSON.parse(raw) as { state?: { currentSpace?: { id?: string } | null } };
    return parsed?.state?.currentSpace?.id ?? "";
  } catch {
    return "";
  }
};

/**
 * Returns the resolved space id for the currently loaded flow (empty when Central).
 */
export const getStudioSpaceId = (): string => resolveStudioSpaceId();

/**
 * Builds the space-scoping header for the currently loaded flow.
 *
 * When no space is selected (Central), the header is omitted so the backend
 * treats the request as scoped to the Central space (SpaceId == null).
 */
export const getStudioSpaceHeaders = (): Record<string, string> => {
  const spaceId = resolveStudioSpaceId();
  return spaceId ? { "X-Space-Id": spaceId } : {};
};

/**
 * Builds the environment-scoping header (`X-Env-Type`) for the currently loaded
 * flow, derived from its publish status.
 *
 * A published agent runs against the `prod` environment, while an unpublished
 * (draft) agent runs against `dev`. This mirrors the backend pattern in
 * `StreamingChatService` where `X-Env-Type` is set to `prod`/`dev` based on
 * `IsPublished`, so the LLM pipeline resolves vault credentials against the
 * same environment the agent is configured for.
 */
export const getStudioEnvHeaders = (): Record<string, string> => {
  const isPublished = useCurrentFlowStore.getState().currentFlow?.isPublished ?? false;
  return { "X-Env-Type": isPublished ? "prod" : "dev" };
};

/**
 * Convenience helper that merges both space and environment headers so the
 * LLM pipeline API calls can pass a single object while preserving both scopes.
 */
export const getStudioConfigHeaders = (): Record<string, string> => ({
  ...getStudioSpaceHeaders(),
  ...getStudioEnvHeaders(),
});
