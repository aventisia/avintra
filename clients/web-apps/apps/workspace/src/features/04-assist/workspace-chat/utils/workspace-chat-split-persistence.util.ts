/** Panel id for the landing chat conversation list. */
export const WORKSPACE_CHAT_LIST_PANEL_ID = "workspace-chat-list";

/** Panel id for the landing chat thread. */
export const WORKSPACE_CHAT_THREAD_PANEL_ID = "workspace-chat-thread";

/** Relative sizes (percentage of the group) of the landing chat split. */
export type WorkspaceChatSplit = { [panelId: string]: number };

const SPLIT_STORAGE_PREFIX = "workspace-landing-chat-split:";

const splitStorageKey = (userEmail: string) => `${SPLIT_STORAGE_PREFIX}${userEmail || "anonymous"}`;

const clampPanelSize = (value: number) => Math.min(Math.max(value, 1), 99);

/**
 * Reads the saved landing chat split for a user, or null when absent or corrupt.
 */
export const getWorkspaceChatSplit = (userEmail: string): WorkspaceChatSplit | null => {
  try {
    const raw = window.localStorage.getItem(splitStorageKey(userEmail));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Record<string, unknown>;
    const list = candidate[WORKSPACE_CHAT_LIST_PANEL_ID];
    const thread = candidate[WORKSPACE_CHAT_THREAD_PANEL_ID];
    if (!Number.isFinite(list) || !Number.isFinite(thread)) return null;

    return {
      [WORKSPACE_CHAT_LIST_PANEL_ID]: clampPanelSize(list as number),
      [WORKSPACE_CHAT_THREAD_PANEL_ID]: clampPanelSize(thread as number),
    };
  } catch {
    return null;
  }
};

/**
 * Persists the landing chat split for a user; best-effort only.
 */
export const saveWorkspaceChatSplit = (userEmail: string, split: WorkspaceChatSplit): void => {
  try {
    window.localStorage.setItem(splitStorageKey(userEmail), JSON.stringify(split));
  } catch {
    // IMPORTANT NOTE: localStorage writes are best-effort; quota or private-mode failures must not break the layout.
  }
};
