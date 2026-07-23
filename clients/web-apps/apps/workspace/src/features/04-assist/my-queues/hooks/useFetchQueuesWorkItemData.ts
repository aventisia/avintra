import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getQueueWorkItemById } from "../apis/queues-table-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch work items using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchQueuesWorkItemData = (workItemId: string) => {
  // Get work items using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...DATA_QUERY_KEY, workItemId],
    queryFn: () => getQueueWorkItemById(workItemId),
    enabled: !!workItemId,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
