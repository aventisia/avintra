import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { QueuesTableDto } from "../dtos/queues-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/queue`;

/**
 * Retrieves list of queues.
 */
export const getQueues = () => {
  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(`${baseAPIURL}/list`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves list of queues assigned to a specific agent (flow version).
 */
export const getQueuesByAgent = (flowVersionId: string) => {
  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(`${baseAPIURL}/by-agent/${flowVersionId}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};
