import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";

import { getQueuesWorkItemsList } from "../apis/work-items-table-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch projects using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchQueusWorkItemsList = () => {
  const { qid } = useParams();
console.log(qid);
  // Get projects using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getQueuesWorkItemsList(qid ?? ""),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
