import { useNavigate } from "react-router-dom";

/**
 * Custom hook to handle opening a machines agents.
 *
 * @returns A function to handle opening the machines agents.
 */
export const useOpenMachine = () => {
  // Get the navigate function
  const navigate = useNavigate();

  // Handle open machine action
  const handleOpenMachineAction = (rowId: string) => {

    // Navigate to machine agent page
    navigate(`/orchestrator/agents?m=${rowId}`);
  };

  // Return the handle open machine action function
  return handleOpenMachineAction;
};
