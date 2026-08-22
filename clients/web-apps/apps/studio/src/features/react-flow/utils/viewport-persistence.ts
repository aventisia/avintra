import { Viewport } from "@xyflow/react";

/**
 * localStorage key prefix for per-user, per-flow-version viewport persistence.
 * Storing the user's last position + zoom lets the agent builder restore the exact
 * canvas view (first few nodes a developer was working on, their zoom level, etc.)
 * across refreshes and parent/sub-flow navigation, instead of re-centering every time.
 */
const VIEWPORT_STORAGE_PREFIX = "studio-flow-viewport";

const storageKey = (versionId: string) => `${VIEWPORT_STORAGE_PREFIX}-${versionId}`;

/**
 * Returns the user's saved viewport for a given flow version, or null if none is stored.
 * A null result means the flow has not been opened by this user yet.
 */
export const getSavedViewport = (versionId: string): Viewport | null => {
  if (!versionId) return null;

  try {
    const raw = window.localStorage.getItem(storageKey(versionId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Viewport;
    if (
      parsed &&
      typeof parsed.x === "number" &&
      typeof parsed.y === "number" &&
      typeof parsed.zoom === "number" &&
      isFinite(parsed.x) &&
      isFinite(parsed.y) &&
      isFinite(parsed.zoom)
    ) {
      return parsed;
    }
  } catch {
    // Ignore corrupt/unparseable entries; treat as "no saved viewport".
  }

  return null;
};

/**
 * Persists the user's viewport for a flow version in localStorage.
 */
export const saveViewport = (versionId: string, viewport: Viewport): void => {
  if (!versionId || !viewport) return;

  try {
    window.localStorage.setItem(storageKey(versionId), JSON.stringify(viewport));
  } catch {
    // Ignore storage failures (e.g. quota exceeded); persistence is best-effort.
  }
};
