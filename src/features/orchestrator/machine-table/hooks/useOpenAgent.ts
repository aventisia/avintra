import { useFlowsTableStore } from "@/features/flows-table/stores/flows-table-store";
import { useShallow } from "zustand/react/shallow";

/**
 * Custom hook to handle opening a agent.
 *
 * @returns A function to handle opening the agent.
 */
export const useOpenAgent = () => {
  // Get flows store state and actions
  const { projectId } = useFlowsTableStore(
    useShallow((state) => ({
      projectId: state.projectId,
    })),
  );

  // Handle open flow action
  const handleOpenAgentAction = (rowId: string) => {
    // Open flow in studio
    window.location.href = `${import.meta.env.VITE_STUDIO_URL}/flow?p=${projectId}&f=${rowId}`;
  };

  // Return the handle open flow action function
  return handleOpenAgentAction;
};
