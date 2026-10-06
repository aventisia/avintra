import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useDirtyNodeConfigGuard } from "@/features/dynamic-config-panel/hooks/useDirtyNodeConfigGuard";
import { useFlowVersionPopoverStore } from "@/features/flow-versions/stores/flow-version-popover-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

/**
 * Custom hook to handle opening a flow.
 *
 * @returns A function to handle opening the flow.
 */
export const useOpenFlow = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Flush a dirty node-config form before the canvas is replaced
  const guardDirtyNodeConfig = useDirtyNodeConfigGuard();

  // Get store state and actions
  const { togglePopoverOpen } = useFlowVersionPopoverStore(
    useShallow((state) => ({
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

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
  const handleOpenFlowAction = (rowId: string, versionId?: string) => {
    // Close popover
    togglePopoverOpen(false);

    // Switching flow/version keeps the same `/agent` path, so the route blocker
    // never sees it and the canvas reload would silently drop a dirty config
    // form. Flush the edits before replacing the canvas (aborts when invalid).
    return guardDirtyNodeConfig(() => openFlow(rowId, versionId), { closeWhenClean: true });
  };

  // Return the handle open flow action function
  return handleOpenFlowAction;
};
