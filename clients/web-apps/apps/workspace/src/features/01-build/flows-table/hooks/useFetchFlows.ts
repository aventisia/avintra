import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getFlows } from "../apis/flows-table-apis";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook to fetch flows using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchFlows = () => {
  // Use this in place FLOWS_QUERY_KEY to handle Personal/Shared tabs list
  // queryKey already includes the current space id.
  const { isPersonal, isArchived, queryKey } = useTableTab();

  // Get flows using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey,
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
