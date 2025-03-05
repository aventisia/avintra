import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useModelsTableStore } from "../stores/models-table-store";

/**
 * Custom hook to set the query key for models.
 * @returns void
 */
export const useModelsQueryKey = () => {
  // Get projectId (p) and projectName (pn)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("p");
  const projectName = queryParams.get("pn");

  // Get store setModelsState action
  const { setModelsState } = useModelsTableStore(
    useShallow((state) => ({
      setModelsState: state.setModelsState,
    })),
  );

  // Throw error if project id or name are not provided
  if (!projectId || !projectName) {
    throw new Error("Project Id and name are required");
  }

  // Set models query key, project id, and project name
  useEffect(() => {
    setModelsState(projectId, projectName);
  }, [projectId, projectName, setModelsState]);
};
