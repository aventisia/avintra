import { useCallback } from "react";

import { useDynamicConfigPanelStore } from "../stores/dcp-store";

/**
 * Boundary handler for DCP panel navigation (X close, Escape, node switch).
 * Flushes the open config form into the canvas store, then runs proceed().
 * Reads the flush via getState() so handlers never capture a stale closure.
 *
 * IMPORTANT NOTE: flush always persists, including incomplete/invalid edits —
 * that mid-edit state is intentional and must survive closing the panel.
 * Navigation always proceeds.
 */
export const useDCPNavigationGuard = () => {
  return useCallback(async (proceed: () => void): Promise<boolean> => {
    await useDynamicConfigPanelStore.getState().flushForm?.();
    proceed();
    return true;
  }, []);
};
