import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getFlowComments } from "../apis/flow-comments-apis";
import { useFlowCommentsStore } from "../stores/flow-comments-store";

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
  const { data, isFetching, isLoading, refetch, isError, error } = useQuery({
    queryKey: fcQueryKey,
    queryFn: () => getFlowComments(flowId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

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
