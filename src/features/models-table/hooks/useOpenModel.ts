import { useQueryClient } from "@tanstack/react-query";
import { MODELS_QUERY_KEY } from "../constants";
import { ModelsTableDto } from "../dtos/models-table-dto";
import { ModelStagesType } from "../types/model-stages-type";

/**
 * Custom hook to handle opening a model.
 *
 * @returns A function to handle opening the model
 */
export const useOpenModel = () => {
  // Get query client
  const queryClient = useQueryClient();

  // Handle open model action
  const handleOpenModelAction = (rowId: string, stage: ModelStagesType) => {
    // Get models data from query client
    const modelsData = queryClient.getQueryData<{
      data: ModelsTableDto[];
    }>(MODELS_QUERY_KEY);

    // Get model data by id
    const modelData = modelsData?.data.find((item) => item.id === rowId);

    // Open model in studio
    let url = '';
    switch (stage) {
      case "Label":
        url = `${import.meta.env.VITE_MODEL_STUDIO_URL}/label?mid=${rowId}&mn=${modelData?.name}`;
        break;
      case "Test":
        url = `${import.meta.env.VITE_MODEL_STUDIO_URL}/test?mid=${rowId}&mn=${modelData?.name}`;
        break;
      case "View":
        url = `${import.meta.env.VITE_MODEL_STUDIO_URL}/label?mid=${rowId}&mn=${modelData?.name}`;
        break;
    }

    window.open(url, '_blank');
  };

  // Return the handle open model action function
  return handleOpenModelAction;
};
