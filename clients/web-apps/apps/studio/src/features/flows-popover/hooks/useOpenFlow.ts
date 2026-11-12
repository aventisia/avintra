import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

interface OpenFlowOptions {
  /**
   * Skip the unsaved-changes alert. Use when the caller has already guarded the
   * action (e.g. "Use as draft": the discard confirm happens before the version
   * is created, so the follow-up navigation must not prompt a second time).
   */
  skipUnsavedGuard?: boolean;
}

/**
 * Custom hook to handle opening a flow.
 *
 * @returns A function to handle opening the flow.
 */
export const useOpenFlow = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Ask before dropping unsaved canvas/config changes
  const guardUnsavedChanges = useUnsavedChangesGuard();

  // Get global store state & actions
  const { setIsFlowLoading } = useCurrentFlowStore(
    useShallow((state) => ({
      setIsFlowLoading: state.setIsFlowLoading,
    })),
  );

  // Build URL with optional versionId and navigate to the flow
  const openFlow = (rowId: string, versionId?: string) => {
    setIsFlowLoading(true);

    const query = versionId ? `?f=${rowId}&v=${versionId}` : `?f=${rowId}`;

    navigate(`/agent${query}`);
  };

  // Handle open flow action
  const handleOpenFlowAction = (
    rowId: string,
    versionId?: string,
    { skipUnsavedGuard = false }: OpenFlowOptions = {},
  ) => {
    const proceed = () => {
      // The canvas is being replaced — close the config panel so it never keeps
      // pointing at a node from the previous flow/version.
      useDynamicConfigPanelStore.getState().closeNodeConfig();
      openFlow(rowId, versionId);
    };

    // Switching flow/version keeps the same `/agent` path, so the route blocker
    // never sees it and the canvas reload would silently drop a dirty config
    // form or unpersisted canvas changes. Confirm before replacing the canvas.
    if (skipUnsavedGuard) {
      proceed();
      return;
    }

    guardUnsavedChanges(proceed);
  };

  // Return the handle open flow action function
  return handleOpenFlowAction;
};
