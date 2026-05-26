import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getKnowledgeBases } from "../apis/knowledge-base-apis";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch knowledgeBase using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchKnowledgeBase = () => {
  // Get knowledgeBase using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getKnowledgeBases(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
