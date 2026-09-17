import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { getAgentsExecutionLogs } from "../apis/job-execution-log-apis";

/**
 * Custom hook to fetch flows using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchExecutionLogsList = () => {
  const [searchParams] = useSearchParams();

  // Sub-flow node logs are persisted under the ROOT flow version that owns the run, so when
  // the user navigates into a sub-flow (`rv` present) the list must stay keyed on that root
  // version. Using the sub-flow's own `v` would return an empty list and blank the panel.
  const currVersionId = searchParams.get("rv") || searchParams.get("v") || "";

  // Get flows using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["AGENT_JOB_EXECUTION", currVersionId],
    queryFn: () => getAgentsExecutionLogs(currVersionId),
    enabled: !!currVersionId,
    refetchOnMount: "always",
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
