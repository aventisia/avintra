import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useEnvironmentStore } from "@/stores/environment-store";

import { getQueuesWorkItemById } from "../apis/work-items-table-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch a single queue work item by ID using react query.
 * The list endpoint strips the payload, so the detail view fetches the full
 * work item (payload, work item data, file URLs) from here.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchQueuesWorkItemById = (workItemId?: string) => {
  const env = useEnvironmentStore((state) => state.env);

  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...DATA_QUERY_KEY, "by-id", workItemId, env],
    queryFn: () => getQueuesWorkItemById(workItemId ?? ""),
    enabled: !!workItemId,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
