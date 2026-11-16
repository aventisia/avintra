/** Panel id for the builder chat column. */
export const UI_BUILDER_CHAT_PANEL_ID = "ui-builder-chat";

/** Panel id for the builder preview column. */
export const UI_BUILDER_PREVIEW_PANEL_ID = "ui-builder-preview";

/** Relative sizes (percentage of the group) of the builder's two panels. */
export type UiBuilderSplit = { [panelId: string]: number };

const SPLIT_STORAGE_PREFIX = "studio-ui-builder-split";

const splitStorageKey = (userEmail: string, projectId: string) =>
  `${SPLIT_STORAGE_PREFIX}:${userEmail}:${projectId}`;

const clampPanelSize = (value: number) => Math.min(Math.max(value, 1), 99);

/**
 * Reads the saved builder split for a user and project, or null when absent or corrupt.
 */
export const getUiBuilderSplit = (userEmail: string, projectId: string): UiBuilderSplit | null => {
  if (!projectId) return null;

  try {
    const raw = window.localStorage.getItem(splitStorageKey(userEmail, projectId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Record<string, unknown>;
    const chat = candidate[UI_BUILDER_CHAT_PANEL_ID];
    const preview = candidate[UI_BUILDER_PREVIEW_PANEL_ID];
    if (!Number.isFinite(chat) || !Number.isFinite(preview)) return null;

    return {
      [UI_BUILDER_CHAT_PANEL_ID]: clampPanelSize(chat as number),
      [UI_BUILDER_PREVIEW_PANEL_ID]: clampPanelSize(preview as number),
    };
  } catch {
    return null;
  }
};

/**
 * Persists the builder split for a user and project; best-effort only.
 */
export const saveUiBuilderSplit = (
  userEmail: string,
  projectId: string,
  split: UiBuilderSplit,
): void => {
  if (!projectId) return;

  try {
    window.localStorage.setItem(splitStorageKey(userEmail, projectId), JSON.stringify(split));
  } catch {
    // IMPORTANT NOTE: localStorage writes are best-effort; quota or private-mode failures must not break the builder.
  }
};
