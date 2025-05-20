import { useNavigate } from "react-router-dom";

/**
 * Custom hook to handle opening a work items.
 *
 * @returns A function to handle opening the work items.
 */
export const useOpenWorkItems = () => {
  // Handle open work items action
  const navigate = useNavigate();
  const handleOpenWorkItemsAction = (rowId: string) => {
    // Open work items in studio
    navigate(`/orchestrator/queues/work-items/${rowId}`);
  };

  // Return the handle open work items action function
  return handleOpenWorkItemsAction;
};
