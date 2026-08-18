import { useUserSessionStore } from "@avplatform/ui/stores";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

/**
 * Builds the space-scoping header for the currently loaded flow.
 *
 * Priority:
 * 1. The currently opened flow's `spaceId` (resolved from the flow itself, so
 *    it is correct even in dev where studio and workspace are separate origins).
 * 2. The space persisted by the workspace app in localStorage under
 *    `current-space:<userEmail>` (used when no flow is loaded).
 *
 * When no space is selected (Central), the header is omitted so the backend
 * treats the request as scoped to the Central space (SpaceId == null).
 */
export const getStudioSpaceHeaders = (): Record<string, string> => {
  // 1. Prefer the currently loaded flow's space.
  const flowSpaceId = useCurrentFlowStore.getState().currentFlow?.spaceId;
  if (flowSpaceId) return { "X-Space-Id": flowSpaceId };

  // 2. Fall back to the workspace-persisted space in localStorage.
  try {
    const userEmail = useUserSessionStore.getState().userSession?.email ?? "anonymous";
    const raw = localStorage.getItem(`current-space:${userEmail}`);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as { state?: { currentSpace?: { id?: string } | null } };
    const spaceId = parsed?.state?.currentSpace?.id;
    return spaceId ? { "X-Space-Id": spaceId } : {};
  } catch {
    return {};
  }
};
