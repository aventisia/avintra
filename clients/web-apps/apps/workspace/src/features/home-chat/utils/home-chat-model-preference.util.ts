import { type ChatEffort } from "@avplatform/chat";

/** The model, effort and web search a Home composer starts with. */
export type HomeChatComposerPreferences = {
  modelKey: string | null;
  effort: ChatEffort | null;
  webSearch: boolean;
};

const PREFERENCES_STORAGE_PREFIX = "home-chat-composer:";
const LEGACY_MODEL_STORAGE_PREFIX = "home-chat-model:";

const storageKey = (tenantId: string, userEmail: string) =>
  `${PREFERENCES_STORAGE_PREFIX}${tenantId}:${userEmail || "anonymous"}`;

const legacyModelStorageKey = (tenantId: string, userEmail: string) =>
  `${LEGACY_MODEL_STORAGE_PREFIX}${tenantId}:${userEmail || "anonymous"}`;

const isChatEffort = (value: unknown): value is ChatEffort =>
  value === "low" || value === "medium" || value === "high";

const NO_PREFERENCES: HomeChatComposerPreferences = {
  modelKey: null,
  effort: null,
  webSearch: false,
};

/** Reads the composer choices the user last saved for a new Home chat. */
export const getHomeChatComposerPreferences = (
  tenantId: string,
  userEmail: string,
): HomeChatComposerPreferences => {
  try {
    const raw = window.localStorage.getItem(storageKey(tenantId, userEmail));
    if (!raw) {
      // IMPORTANT NOTE: older builds stored only the model key; it stays the first-run default.
      return {
        ...NO_PREFERENCES,
        modelKey: window.localStorage.getItem(legacyModelStorageKey(tenantId, userEmail)),
      };
    }
    const saved = JSON.parse(raw) as Partial<HomeChatComposerPreferences>;
    return {
      modelKey: typeof saved.modelKey === "string" ? saved.modelKey : null,
      effort: isChatEffort(saved.effort) ? saved.effort : null,
      webSearch: saved.webSearch === true,
    };
  } catch {
    return NO_PREFERENCES;
  }
};

/** Remembers the composer choices the user made; best-effort only. */
export const saveHomeChatComposerPreferences = (
  tenantId: string,
  userEmail: string,
  preferences: HomeChatComposerPreferences,
) => {
  try {
    window.localStorage.setItem(storageKey(tenantId, userEmail), JSON.stringify(preferences));
  } catch {
    // IMPORTANT NOTE: localStorage writes are best-effort; quota or private-mode failures must not block selection.
  }
};

/** The saved model when the tenant still offers it, otherwise the first model offered. */
export const resolveHomeChatModel = <TModel extends { key: string }>(
  models: readonly TModel[],
  savedKey: string | null,
): TModel | undefined => models.find((model) => model.key === savedKey) ?? models[0];
