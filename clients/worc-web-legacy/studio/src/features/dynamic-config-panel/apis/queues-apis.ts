import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { QueuesTableDto } from "../dtos/queues-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/queue`;

/**
 * Retrieves list of queues.
 */
export const getQueues = () => {
  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};
