/** Panel id for the User Interfaces list column. */
export const MY_INTERFACES_LIST_PANEL_ID = "my-interfaces-list";

/** Panel id for the User Interfaces detail column. */
export const MY_INTERFACES_PANE_PANEL_ID = "my-interfaces-pane";

/** Relative sizes (percentage of the group) of the User Interfaces split. */
export type MyInterfacesSplit = { [panelId: string]: number };

const SPLIT_STORAGE_PREFIX = "workspace-my-interfaces-split:";

const splitStorageKey = (userEmail: string) => `${SPLIT_STORAGE_PREFIX}${userEmail || "anonymous"}`;

const clampPanelSize = (value: number) => Math.min(Math.max(value, 1), 99);

/**
 * Reads the saved User Interfaces split for a user, or null when absent or corrupt.
 */
export const getMyInterfacesSplit = (userEmail: string): MyInterfacesSplit | null => {
  try {
    const raw = window.localStorage.getItem(splitStorageKey(userEmail));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Record<string, unknown>;
    const list = candidate[MY_INTERFACES_LIST_PANEL_ID];
    const pane = candidate[MY_INTERFACES_PANE_PANEL_ID];
    if (!Number.isFinite(list) || !Number.isFinite(pane)) return null;

    return {
      [MY_INTERFACES_LIST_PANEL_ID]: clampPanelSize(list as number),
      [MY_INTERFACES_PANE_PANEL_ID]: clampPanelSize(pane as number),
    };
  } catch {
    return null;
  }
};

/**
 * Persists the User Interfaces split for a user; best-effort only.
 */
export const saveMyInterfacesSplit = (userEmail: string, split: MyInterfacesSplit): void => {
  try {
    window.localStorage.setItem(splitStorageKey(userEmail), JSON.stringify(split));
  } catch {
    // IMPORTANT NOTE: localStorage writes are best-effort; quota or private-mode failures must not break the layout.
  }
};
