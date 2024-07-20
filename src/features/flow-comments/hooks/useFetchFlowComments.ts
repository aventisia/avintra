import {
  getFlowComments,
  useFlowCommentsStore,
} from "@/features/flow-comments";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";

/**
 * Custom hook to fetch flow comments.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchFlowComments = () => {
  // Get store state and actions
  const { flowId, fcQueryKey, isPopoverOpen } = useFlowCommentsStore(
    useShallow((state) => ({
      flowId: state.flowId,
      fcQueryKey: state.fcQueryKey,
      isPopoverOpen: state.isPopoverOpen,
    })),
  );

  // Get flow comments using react query
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: fcQueryKey,
    queryFn: () => getFlowComments(flowId),
  });

  // Refetch flow comments on popover open
  useEffect(() => {
    if (isPopoverOpen) {
      // Refetch flow comments
      refetch();
    }
  }, [isPopoverOpen, refetch]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
