import { useNavigate } from "react-router-dom";

/**
 * Custom hook to handle opening a work items payload table.
 *
 * @returns A function to handle opening the work items payload table.
 */
export const useOpenPayloadTable = () => {
  // Handle open work items action
  const navigate = useNavigate();
  const handleOpenWorkItemsAction = (rowId: string) => {
    // Open work items in studio
    navigate(`/orchestrator/queues/payload-table/${rowId}`);
  };

  // Return the handle open work items action function
  return handleOpenWorkItemsAction;
};
