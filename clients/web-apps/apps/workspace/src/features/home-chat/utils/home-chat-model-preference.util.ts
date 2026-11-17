const MODEL_STORAGE_PREFIX = "home-chat-model:";

const modelStorageKey = (tenantId: string, userEmail: string) =>
  `${MODEL_STORAGE_PREFIX}${tenantId}:${userEmail || "anonymous"}`;

/** Reads the model key the user last picked in the Home composer, or null when none is saved. */
export const getHomeChatModelKey = (tenantId: string, userEmail: string): string | null => {
  try {
    return window.localStorage.getItem(modelStorageKey(tenantId, userEmail));
  } catch {
    return null;
  }
};

/** Remembers the model key the user picked in the Home composer; best-effort only. */
export const saveHomeChatModelKey = (tenantId: string, userEmail: string, modelKey: string) => {
  try {
    window.localStorage.setItem(modelStorageKey(tenantId, userEmail), modelKey);
  } catch {
    // IMPORTANT NOTE: localStorage writes are best-effort; quota or private-mode failures must not block model selection.
  }
};

/** The saved model when the tenant still offers it, otherwise the first model offered. */
export const resolveHomeChatModel = <TModel extends { key: string }>(
  models: readonly TModel[],
  savedKey: string | null,
): TModel | undefined => models.find((model) => model.key === savedKey) ?? models[0];
