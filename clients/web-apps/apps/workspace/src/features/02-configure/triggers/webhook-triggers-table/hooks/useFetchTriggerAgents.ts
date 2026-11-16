import type { IHttpResponse } from "@avplatform/ui/dtos";
import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { geTriggerAgents } from "../apis/triggers-table-apis";
import type { SearchAgentsDto } from "../dtos/search-agent-dto";

/**
 * Custom hook to fetch agents using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTriggerAgents = (id: string) => {
  // Get agents using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["select-trigger-agent", id],
    queryFn: () => geTriggerAgents(id),
    // IMPORTANT NOTE: the webhook endpoint returns its single agent (or null), not a list.
    select: (response): IHttpResponse<SearchAgentsDto[]> => ({
      ...response,
      data: response.data ? [response.data] : [],
    }),
    enabled: !!id,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, isError };
};
