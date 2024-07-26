import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useFlowCommentsStore } from "../stores/flow-comments-store";

/**
 * Custom hook to set the query key for flow comments.
 */
export const useFlowCommentsQueryKey = () => {
  // Get flowId (f) param from url
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const flowId = queryParams.get("f");

  // Get store setFCQueryKey action
  const { setFCQueryKey } = useFlowCommentsStore(
    useShallow((state) => ({
      setFCQueryKey: state.setFCQueryKey,
    })),
  );

  // Throw error if flow ID is not provided
  if (!flowId) {
    throw new Error("Flow Id is required");
  }

  // Set flow comments query key
  useEffect(() => {
    setFCQueryKey(flowId);
  }, [flowId, setFCQueryKey]);
};
