import { useQuery } from "@tanstack/react-query";

import { getAgentRunActivity } from "../apis/job-execution-log-apis";

export const AGENT_RUN_ACTIVITY_DAYS = 14;

/**
 * Fetches an agent's run activity for the last 14 local days, bucketed in the viewer's timezone.
 */
export const useFetchAgentRunActivity = (flowId: string) => {
  const utcOffsetMinutes = -new Date().getTimezoneOffset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["agent-run-activity", flowId, utcOffsetMinutes],
    queryFn: () => getAgentRunActivity(flowId, AGENT_RUN_ACTIVITY_DAYS, utcOffsetMinutes),
    enabled: Boolean(flowId),
    select: (response) => response.data,
  });

  return { activity: data, isLoading, isError };
};
