import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getFlows } from "../apis/flows-table-apis";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook to fetch flows using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchFlows = () => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  // Use this in place FLOWS_QUERY_KEY to handle Personal/Shared tabs list
  const { isPersonal, isArchived, queryKey } = useTableTab();

  // Get flows using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [...queryKey, currentSpace?.id],
    queryFn: () => getFlows({ isPersonal }),
    enabled: !isArchived,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
