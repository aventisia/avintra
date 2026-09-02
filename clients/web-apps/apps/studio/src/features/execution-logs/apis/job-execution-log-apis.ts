import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { JobExecutionLogDetailDto } from "../dtos/job-execution-log-details-dto";
import { JobExecutionLogDto } from "../dtos/job-execution-log-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/job-execution-logs`;

/**
 * Retrieves all agents execution logs
 */
const getAgentsExecutionLogs = (flowVersionId: string) => {
  return axiosInstance
    .get<IHttpResponse<JobExecutionLogDto[]>>(`${baseAPIURL}/list/${flowVersionId}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Get agents detail execution log by id
 */
const getAgentsExecutionLogsById = (jobId: string) => {
  return axiosInstance
    .get<IHttpResponse<JobExecutionLogDetailDto>>(`${baseAPIURL}/detail/${jobId}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

export { getAgentsExecutionLogs, getAgentsExecutionLogsById };
