import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DATA_QUERY_KEY } from "../constants";
import { ModelLibraryTableDto } from "../dtos/model-library-table-dto";

/**
 * Custom hook to handle opening a model test.
 *
 * @returns A function to handle opening the model test.
 */
export const useOpenModelTest = () => {
  // Get the navigate function
  const navigate = useNavigate();

  // Get query client
  const queryClient = useQueryClient();

  // Handle open model action
  const handleOpenTestAction = (rowId: string) => {
    // Get models data from query client
    const modelsData = queryClient.getQueryData<{
      data: ModelLibraryTableDto[];
    }>(DATA_QUERY_KEY);

    // Get model data by id
    const modelData = modelsData?.data.find((item) => item.id === rowId);

    const testObj = { model_id: rowId, model_name: modelData?.name };
    //Add model is to localstorage
    localStorage.setItem("model_test", JSON.stringify(testObj));

    // Navigate to model flows page
    navigate(`/test?mid=${rowId}&mn=${modelData?.name || "Model"}`);
  };

  // Return the handle open model action function
  return handleOpenTestAction;
};
