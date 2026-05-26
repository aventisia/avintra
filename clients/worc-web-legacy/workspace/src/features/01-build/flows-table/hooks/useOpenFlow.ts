/**
 * Custom hook to handle opening a flow.
 *
 * @returns A function to handle opening the flow.
 */
export const useOpenFlow = () => {
  // Handle open flow action
  const handleOpenFlowAction = (rowId: string) => {
    // Open flow in studio
    window.location.href = `${import.meta.env.VITE_AGENTBUILDER_PATH}agent?f=${rowId}`;
  };

  // Return the handle open flow action function
  return handleOpenFlowAction;
};
