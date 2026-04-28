import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { JobExecutionLogDetailDto } from "../dtos/job-execution-log-details-dto";
import { JobExecutionLogDto } from "../dtos/job-execution-log-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/job-execution-logs`;

/**
 * Retrieves all agents execution logs
 */
const getAgentsExecutionLogs = (flowVersionId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<JobExecutionLogDto[]>
    >(`${baseAPIURL}/list/${flowVersionId}`)
    .then((res) => res.data);
};

/**
 * Get agents detail execution log by id
 */
const getAgentsExecutionLogsById = (jobId: string) => {
  return axiosInstance
    .get<IHttpResponse<JobExecutionLogDetailDto>>(`${baseAPIURL}/detail/${jobId}`)
    .then((res) => res.data);
};

export { getAgentsExecutionLogs, getAgentsExecutionLogsById };
