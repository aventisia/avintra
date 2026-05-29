/**
 * Custom hook to handle opening a Archived flow.
 *
 * @returns A function to handle opening the archived flow.
 */
export const useOpenArchivedFlow = () => {
  // Handle open archived flow action
  const handleOpenArchivedFlowAction = (rowId: string, versionId: string) => {
    // Open archived flow in studio
    window.location.href = `${import.meta.env.VITE_STUDIO_PATH}agent?f=${rowId}&v=${versionId}`;
  };

  // Return the handle open Archived flow action function
  return handleOpenArchivedFlowAction;
};
