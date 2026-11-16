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

/** Panel id for the home chat file preview column. */
export const WORKSPACE_CHAT_PREVIEW_PANEL_ID = "workspace-chat-file";

/** Relative sizes (percentage of the group) of the home chat and its file preview. */
export type WorkspaceChatPreviewSplit = { [panelId: string]: number };

const PREVIEW_SPLIT_STORAGE_PREFIX = "workspace-chat-preview-split:";

const previewSplitStorageKey = (userEmail: string) =>
  `${PREVIEW_SPLIT_STORAGE_PREFIX}${userEmail || "anonymous"}`;

/**
 * Reads the saved home chat preview split for a user, or null when absent or corrupt.
 */
export const getWorkspaceChatPreviewSplit = (
  userEmail: string,
): WorkspaceChatPreviewSplit | null => {
  try {
    const raw = window.localStorage.getItem(previewSplitStorageKey(userEmail));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Record<string, unknown>;
    const thread = candidate[WORKSPACE_CHAT_THREAD_PANEL_ID];
    const preview = candidate[WORKSPACE_CHAT_PREVIEW_PANEL_ID];
    if (!Number.isFinite(thread) || !Number.isFinite(preview)) return null;

    return {
      [WORKSPACE_CHAT_THREAD_PANEL_ID]: clampPanelSize(thread as number),
      [WORKSPACE_CHAT_PREVIEW_PANEL_ID]: clampPanelSize(preview as number),
    };
  } catch {
    return null;
  }
};

/**
 * Persists the home chat preview split for a user; best-effort only.
 */
export const saveWorkspaceChatPreviewSplit = (
  userEmail: string,
  split: WorkspaceChatPreviewSplit,
): void => {
  try {
    window.localStorage.setItem(previewSplitStorageKey(userEmail), JSON.stringify(split));
  } catch {
    // IMPORTANT NOTE: localStorage writes are best-effort; quota or private-mode failures must not break the layout.
  }
};
