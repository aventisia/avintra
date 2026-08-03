import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getFlows } from "../apis/flows-table-apis";
import { FLOWS_QUERY_KEY } from "../constants/constants";
import { useFlowsPopoverStore } from "../stores/flows-popover-store";

/**
 * Custom hook to fetch flows using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchFlows = () => {
  // Get flows store state and actions
  const { isPopoverOpen, setFlowsCount } = useFlowsPopoverStore(
    useShallow((state) => ({
      isPopoverOpen: state.isPopoverOpen,
      setFlowsCount: state.setFlowsCount,
    })),
  );

  // Get flows using react query
  const { data, refetch, isFetching, isLoading, isError, error } = useQuery({
    queryKey: FLOWS_QUERY_KEY,
    queryFn: () => getFlows(),
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
