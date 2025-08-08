/**
 * Custom hook to handle opening a flow.
 *
 * @returns A function to handle opening the flow.
 */
export const useOpenFlow = () => {
  // Handle open flow action
  const handleOpenFlowAction = (rowId: string, versionId: string) => {
    // Open flow in studio
    window.location.href = `${import.meta.env.VITE_AGENTBUILDER_URL}/agent?f=${rowId}&v=${versionId}`;
  };

  // Return the handle open flow action function
  return handleOpenFlowAction;
};
