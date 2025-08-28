import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useModelTestStore } from "../stores/model-test-store";

/**
 * Custom hook to set the query key for Test model.
 * @returns void
 */
export const useModelTestQueryKey = () => {
  // Get modelId (m) and modelName (pn)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  let modelId = queryParams.get("pid");
  let modelName = queryParams.get("pn");

  // Get store setModelDataState action
  const { setModelDataState } = useModelTestStore(
    useShallow((state) => ({
      setModelDataState: state.setModelDataState,
    })),
  );

  // Throw error if model id or name are not provided
  if (!modelId || !modelName) {
    const test = localStorage.getItem("label_data") || "{}";
    const testObj = JSON.parse(test);
    modelId = testObj?.model_id;
    modelName = testObj?.model_name;
    if (!modelId || !modelName) {
      throw new Error("Model Id and name are required");
    }
  }

  // Set LabelData query key, model id, and model name
  useEffect(() => {
    setModelDataState(modelId, modelName);
  }, [modelId, modelName, setModelDataState]);
};
