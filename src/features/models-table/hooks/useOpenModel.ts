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
    let url = "";
    switch (stage) {
      case "Label":
        url =
          window.location.origin +
          `${import.meta.env.VITE_AISTUDIO_PATH}project?pid=${rowId}&v=${modelData?.latestVersionId}&pn=${modelData?.name}&t=setup`;
        break;
      case "Test":
        url =
          window.location.origin +
          `${import.meta.env.VITE_AISTUDIO_PATH}project?pid=${rowId}&v=${modelData?.latestVersionId}&pn=${modelData?.name}&t=setup`;
        break;
      case "View":
        url =
          window.location.origin +
          `${import.meta.env.VITE_AISTUDIO_PATH}project?pid=${rowId}&v=${modelData?.latestVersionId}&pn=${modelData?.name}&t=setup`;
        break;
    }

    // Conditionally add the ml parameter based on the environment mode
    url += import.meta.env.MODE !== "production" ? "" : `&ml=inferencing`;

    return url;
  };

  // Return the handle open model action function
  return handleOpenModelAction;
};
