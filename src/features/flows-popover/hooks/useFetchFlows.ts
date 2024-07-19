import {
  getProjectFlows,
  useFlowsPopoverStore,
} from "@/features/flows-popover";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";

/**
 * Custom hook to fetch associated flows with project using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchFlows = () => {
  // Get flows store state and actions
  const { projectId, isPopoverOpen, setFlowsCount, flowsQueryKey } =
    useFlowsPopoverStore(
      useShallow((state) => ({
        projectId: state.projectId,
        isPopoverOpen: state.isPopoverOpen,
        setFlowsCount: state.setFlowsCount,
        flowsQueryKey: state.flowsQueryKey,
      })),
    );

  // Get flows using react query
  const { data, refetch, isFetching, isLoading } = useQuery({
    queryKey: flowsQueryKey,
    queryFn: () => getProjectFlows(projectId),
  });

  // Refetch flow comments on popover open
  useEffect(() => {
    if (isPopoverOpen) refetch();
  }, [isPopoverOpen, refetch]);

  // Set flows count
  useEffect(() => {
    setFlowsCount(data?.data?.length || 0);
  }, [data, setFlowsCount]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
