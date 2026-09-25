import { useDynamicConfigPanelStore } from "../stores/dcp-store";

interface DirtyNodeConfigGuardOptions {
  /**
   * Also close the config panel when the form is clean. Use this when the
   * canvas is being replaced (flow/version switch) so the panel doesn't keep
   * pointing at a node that no longer exists.
   */
  closeWhenClean?: boolean;
}

/**
 * Wraps an action that consumes or replaces the canvas so an open, dirty
 * node-config form is committed first and never silently dropped. Awaits the
 * registered flush, then runs the action.
 *
 * IMPORTANT NOTE: flush always persists, including incomplete/invalid edits —
 * that mid-edit state is intentional and must survive the action.
 */
export const useDirtyNodeConfigGuard = () => {
  return async (
    action: () => void,
    { closeWhenClean = false }: DirtyNodeConfigGuardOptions = {},
  ): Promise<boolean> => {
    await useDynamicConfigPanelStore.getState().flushForm?.();
    if (closeWhenClean) useDynamicConfigPanelStore.getState().closeNodeConfig();
    action();
    return true;
  };
};
