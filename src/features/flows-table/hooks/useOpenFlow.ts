import { useShallow } from "zustand/react/shallow";
import { useFlowsTableStore } from "../stores/flows-table-store";

/**
 * Custom hook to handle opening a flow.
 *
 * @returns A function to handle opening the flow.
 */
export const useOpenFlow = () => {
  // Get flows store state and actions
  const { projectId } = useFlowsTableStore(
    useShallow((state) => ({
      projectId: state.projectId,
    })),
  );

  // Handle open flow action
  const handleOpenFlowAction = (rowId: string) => {
    // Open flow in studio
    window.location.href = `${import.meta.env.VITE_STUDIO_URL}flow?p=${projectId}&f=${rowId}`;
  };

  // Return the handle open flow action function
  return handleOpenFlowAction;
};
