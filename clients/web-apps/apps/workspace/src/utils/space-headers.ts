import { useCurrentSpaceStore } from "@/stores/current-space-store";

/**
 * Builds the space-scoping headers from the currently selected space.
 * When no space is selected (Central), the header is omitted so the backend
 * treats the request as scoped to the Central space (SpaceId == null).
 */
export const getSpaceHeaders = (): Record<string, string> => {
  const spaceId = useCurrentSpaceStore.getState().currentSpace?.id;
  return spaceId ? { "X-Space-Id": spaceId } : {};
};
