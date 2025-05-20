import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useFlowsPopoverStore } from "../stores/flows-popover-store";

/**
 * Custom hook to handle opening a flow.
 *
 * @returns A function to handle opening the flow.
 */
export const useOpenFlow = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Get store state and actions
  const { togglePopoverOpen } = useFlowsPopoverStore(
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
  const handleOpenFlowAction = (rowId: string) => {
    // Close popover
    togglePopoverOpen(false);

    // Set flow loading state
    setIsFlowLoading(true);

    // Navigate to flow
    navigate(`/flow?f=${rowId}`);
  };

  // Return the handle open flow action function
  return handleOpenFlowAction;
};
