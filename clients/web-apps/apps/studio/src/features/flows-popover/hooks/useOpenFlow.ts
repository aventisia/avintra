import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

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

  // Handle open flow action
  const handleOpenFlowAction = (rowId: string, versionId?: string) => {
    // Close popover
    togglePopoverOpen(false);

    // Set flow loading state
    setIsFlowLoading(true);

    // Build URL with optional versionId
    const query = versionId ? `?f=${rowId}&v=${versionId}` : `?f=${rowId}`;

    // Navigate to flow
    navigate(`/agent${query}`);
  };

  // Return the handle open flow action function
  return handleOpenFlowAction;
};
