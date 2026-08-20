import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getKnowledgeBaseFiles } from "../apis/knowledge-base-file-apis";
import { DETAIL_DATA_QUERY_KEY } from "../constants";
import { useEnvironmentStore } from "@/stores/environment-store";

/**
 * Custom hook to fetch knowledgeBase using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchKBFiles = (knowledgeBaseId: string) => {
  const env = useEnvironmentStore((state) => state.env);
  // Get knowledgeBase using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [...DETAIL_DATA_QUERY_KEY, knowledgeBaseId, env],
    queryFn: () => getKnowledgeBaseFiles(knowledgeBaseId),
    enabled: Boolean(knowledgeBaseId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
