import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import {
  executionLogsQueryOptions,
  resolveRunsVersionId,
} from "../utils/execution-logs-query.util";

/** Fetches the execution log list for the current flow version. */
export const useFetchExecutionLogsList = () => {
  const [searchParams] = useSearchParams();

  const currVersionId = resolveRunsVersionId(searchParams);

  const { data, isFetching, isError, error, refetch } = useQuery({
    ...executionLogsQueryOptions(currVersionId),
    enabled: !!currVersionId,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isError, refetch };
};
