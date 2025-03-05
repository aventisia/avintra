import { useShallow } from "zustand/react/shallow";
import { useModelsTableStore } from "../stores/models-table-store";

/**
 * Custom hook to handle opening a model.
 *
 * @returns A function to handle opening the model
 */
export const useOpenModel = () => {
  // Get models store state and actions
  const { projectId } = useModelsTableStore(
    useShallow((state) => ({
      projectId: state.projectId,
    })),
  );

  // Handle open model action
  const handleOpenModelAction = (rowId: string, action: string) => {
    // Open model in studio
    switch (action) {
      case "label":
        window.location.href = `${import.meta.env.VITE_MODEL_STUDIO_URL}/label?p=${projectId}&m=${rowId}`;
        break;
      case "test":
        window.location.href = `${import.meta.env.VITE_MODEL_STUDIO_URL}/test?p=${projectId}&m=${rowId}`;
        break;
      case "view":
        window.location.href = `${import.meta.env.VITE_MODEL_STUDIO_URL}/test?p=${projectId}&m=${rowId}`;
        break;
    }
  };

  // Return the handle open model action function
  return handleOpenModelAction;
};
