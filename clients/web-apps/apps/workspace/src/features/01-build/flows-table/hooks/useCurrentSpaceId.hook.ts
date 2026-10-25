import { useCurrentSpaceStore } from "@/stores/current-space-store";

/**
 * Returns the id of the current space, or an empty string for the Central space.
 */
export const useCurrentSpaceId = () =>
  useCurrentSpaceStore((state) => state.currentSpace?.id ?? "");
