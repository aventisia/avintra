import {
  useFlowsPopoverStore,
} from "@/features/flows-popover";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";

/**
 * Custom hook to set the query key for flows.
 */
export const useFlowsQueryKey = () => {
  // Get projectId (p)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("p");

  // Get store setFlowsQueryKey action
  const { setFlowsQueryKey } = useFlowsPopoverStore(
    useShallow((state) => ({
      setFlowsQueryKey: state.setFlowsQueryKey,
    })),
  );

  // Throw error if project id is not provided
  if (!projectId) {
    throw new Error("Project Id is required");
  }

  // Set flows query key
  useEffect(() => {
    setFlowsQueryKey(projectId);
  }, [projectId, setFlowsQueryKey]);
};
