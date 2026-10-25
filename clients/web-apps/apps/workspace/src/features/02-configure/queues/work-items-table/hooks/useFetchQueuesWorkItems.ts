import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { useEnvironmentStore } from "@/stores/environment-store";

import { getQueuesWorkItemsList } from "../apis/work-items-table-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch projects using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchQueuesWorkItems = () => {
  // Get projects using react query

  const { qid } = useParams();
  const env = useEnvironmentStore((state) => state.env);
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...DATA_QUERY_KEY, qid, env],
    queryFn: () => getQueuesWorkItemsList(qid ?? ""),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
