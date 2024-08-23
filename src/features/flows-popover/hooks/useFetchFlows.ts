import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { getProjectFlows } from "../apis/flows-table-apis";
import { useFlowsPopoverStore } from "../stores/flows-popover-store";

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
  const { data, refetch, isFetching, isLoading, isError, error } = useQuery({
    queryKey: flowsQueryKey,
    queryFn: () => getProjectFlows(projectId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

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
