import { useFlowCommentsStore } from "@/features/flow-comments";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";

/**
 * Custom hook to set the query key for flow comments.
 */
export const useFlowCommentsQueryKey = () => {
  // Get flowId (f) param from url
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const flowId = queryParams.get("f");

  // Get store setFCsQueryKey action
  const { setFCsQueryKey } = useFlowCommentsStore(
    useShallow((state) => ({
      setFCsQueryKey: state.setFCsQueryKey,
    })),
  );

  // Throw error if flow ID is not provided
  if (!flowId) {
    throw new Error("Flow Id is required");
  }

  // Set flow comments query key
  useEffect(() => {
    setFCsQueryKey(flowId);
  }, [flowId, setFCsQueryKey]);
};
