import { useEnvironmentStore } from "@/stores/environment-store";
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

/**
 * Builds the environment-scoping headers from the currently selected
 * Dev/Prod environment. The backend uses `X-Env-Type` to scope config
 * entities (Skill, Queues, Tools, Key Store, Vault, Knowledge Base,
 * Triggers, App Secret) to the active environment.
 */
export const getEnvHeaders = (): Record<string, string> => {
  const env = useEnvironmentStore.getState().env;
  return { "X-Env-Type": env };
};

/**
 * Convenience helper that merges both space and environment headers so the
 * Configure API calls can pass a single object while preserving both scopes.
 */
export const getConfigHeaders = (): Record<string, string> => ({
  ...getSpaceHeaders(),
  ...getEnvHeaders(),
});
