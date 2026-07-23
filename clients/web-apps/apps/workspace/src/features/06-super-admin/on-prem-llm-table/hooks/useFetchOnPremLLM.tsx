import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getOnPremLLMList } from "../apis/on-prem-llm-table-apis";
import { ONPREM_LLM_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch models using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchOnPremLLMs = () => {
  // Get models using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ONPREM_LLM_QUERY_KEY,
    queryFn: () => getOnPremLLMList(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
