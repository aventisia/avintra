import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useFlowsTableStore } from "../stores/flows-table-store";

/**
 * Custom hook to set the query key for flows.
 * @returns void
 */
export const useFlowsQueryKey = () => {
  // Get projectId (p) and projectName (pn)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("p");
  const projectName = queryParams.get("pn");

  // Get store setFlowsState action
  const { setFlowsState } = useFlowsTableStore(
    useShallow((state) => ({
      setFlowsState: state.setFlowsState,
    })),
  );

  // Throw error if project id or name are not provided
  if (!projectId || !projectName) {
    throw new Error("Project Id and name are required");
  }

  // Set flows query key, project id, and project name
  useEffect(() => {
    setFlowsState(projectId, projectName);
  }, [projectId, projectName, setFlowsState]);
};
