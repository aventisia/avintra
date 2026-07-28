import { useQuery } from "@tanstack/react-query";

import { getAgentsExecutionLogs } from "../apis/job-execution-log-apis";

export const useFetchExecutionLogsDetail = (id: string) => {
  return useQuery({
    queryKey: ["JOB_EXECUTION_DETAIL", id],
    queryFn: () => getAgentsExecutionLogs(id),
    enabled: false,
    select: (res) => res.data,
  });
};
