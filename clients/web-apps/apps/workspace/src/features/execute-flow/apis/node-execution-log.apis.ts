import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { NodeExecutionLogDto } from "../dtos/node-execution-log.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/job`;

/**
 * Inserts a batch of node execution logs for a job.
 */
export const insertNodeExecutionLogs = (
  jobId: string,
  logs: NodeExecutionLogDto[]
) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(
      `${baseAPIURL}/${jobId}/node-execution-logs`,
      logs
    )
    .then((res) => res.data);
};

/**
 * Retrieves all node execution logs for a job.
 */
export const getNodeExecutionLogs = (jobId: string) => {
  return axiosInstance
    .get<IHttpResponse<NodeExecutionLogDto[]>>(
      `${baseAPIURL}/${jobId}/node-execution-logs`
    )
    .then((res) => res.data);
};
