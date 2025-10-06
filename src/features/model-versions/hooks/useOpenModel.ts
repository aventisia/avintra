import { useNavigate } from "react-router-dom";

/**
 * Custom hook to handle opening a model.
 *
 * @returns A function to handle opening the model
 */
export const useOpenModel = () => {
  const navigate = useNavigate();

  // Handle open model action
  const handleOpenModelAction = (
    rowId: string,
    name?: string,
    versionId?: string,
  ) => {
    // Open model in studio
    const url = `/project?pid=${rowId}&v=${versionId}&pn=${name}&t=setup`;

    navigate(url);
  };

  // Return the handle open model action function
  return handleOpenModelAction;
};
