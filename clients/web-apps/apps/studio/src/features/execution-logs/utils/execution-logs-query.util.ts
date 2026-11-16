import { QueryClient, queryOptions } from "@tanstack/react-query";

import { getAgentsExecutionLogs } from "../apis/job-execution-log-apis";

// IMPORTANT NOTE: Sub-flow node logs are persisted under the ROOT flow version that owns
// the run, so when the user navigates into a sub-flow (`rv` present) the list must stay
// keyed on that root version. Using the sub-flow's own `v` would return an empty list and
// blank the panel.
export const resolveRunsVersionId = (searchParams: URLSearchParams) =>
  searchParams.get("rv") || searchParams.get("v") || "";

export const executionLogsQueryOptions = (versionId: string) =>
  queryOptions({
    queryKey: ["AGENT_JOB_EXECUTION", versionId],
    queryFn: () => getAgentsExecutionLogs(versionId),
  });

/** Fetches the runs for the version in the URL and counts them; `null` when the URL names no version. */
export const countExecutionLogs = async (
  queryClient: QueryClient,
  searchParams: URLSearchParams,
): Promise<number | null> => {
  const versionId = resolveRunsVersionId(searchParams);
  if (!versionId) return null;

  const response = await queryClient.fetchQuery(executionLogsQueryOptions(versionId));
  return response.data?.length ?? 0;
};
