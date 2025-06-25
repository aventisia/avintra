import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

/**
 * Custom hook to handle opening a flow.
 *
 * @returns A function to handle opening the flow.
 */
export const useOpenFlow = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Get global store state & actions
  const { setIsFlowLoading } = useCurrentFlowStore(
    useShallow((state) => ({
      setIsFlowLoading: state.setIsFlowLoading,
    })),
  );

  // Handle open flow action
  const handleOpenFlowAction = (rowId: string, versionId?: string) => {
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
