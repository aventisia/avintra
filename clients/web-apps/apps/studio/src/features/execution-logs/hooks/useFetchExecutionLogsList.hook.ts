import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { getAgentsExecutionLogs } from "../apis/job-execution-log-apis";

/** Fetches the execution log list for the current flow version. */
export const useFetchExecutionLogsList = () => {
  const [searchParams] = useSearchParams();

  // IMPORTANT NOTE: Sub-flow node logs are persisted under the ROOT flow version that owns
  // the run, so when the user navigates into a sub-flow (`rv` present) the list must stay
  // keyed on that root version. Using the sub-flow's own `v` would return an empty list and
  // blank the panel.
  const currVersionId = searchParams.get("rv") || searchParams.get("v") || "";

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["AGENT_JOB_EXECUTION", currVersionId],
    queryFn: () => getAgentsExecutionLogs(currVersionId),
    enabled: !!currVersionId,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isError, refetch };
};
