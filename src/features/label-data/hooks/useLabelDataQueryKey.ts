import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useModelDataStore } from "../stores/model-data-store";

/**
 * Custom hook to set the query key for LabelData.
 * @returns void
 */
export const useLabelDataQueryKey = () => {
  // Get modelId (m) and modelName (pn)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  let modelId = queryParams.get("m");
  let modelName = queryParams.get("mn");

  // Get store setModelDataState action
  const { setModelDataState } = useModelDataStore(
    useShallow((state) => ({
      setModelDataState: state.setModelDataState,
    })),
  );

  // Throw error if model id or name are not provided
  if (!modelId || !modelName) {
    modelId = localStorage.getItem("model_id");
    modelName = localStorage.getItem("model_name");
    if (!modelId || !modelName) {
      throw new Error("Model Id and name are required");
    }
  }

  // Set LabelData query key, model id, and model name
  useEffect(() => {
    setModelDataState(modelId, modelName);
  }, [modelId, modelName, setModelDataState]);
};
