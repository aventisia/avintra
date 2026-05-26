import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { QueueAgentsDto } from "../dtos/queue-agents-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/queue-agent`;

/**
 * Retrieves list of queue agents.
 */
export const getQueueAgents = (queueId: string) => {
  return axiosInstance
    .get<IHttpResponse<QueueAgentsDto[]>>(`${baseAPIURL}/${queueId}/list`)
    .then((res) => res.data);
};

/**
 * Inserts(Assign) a new queue agent.
 */
export const insertQueueAgent = (queueAgent: QueueAgentsDto) => {
  return axiosInstance
    .post<IHttpResponse<QueueAgentsDto>>(`${baseAPIURL}`, queueAgent)
    .then((res) => res.data);
};

/**
 * Updates an existing queue agent.
 */
export const updateQueueAgent = (updatedAgent: QueueAgentsDto) => {
  return axiosInstance
    .put<IHttpResponse<QueueAgentsDto>>(`${baseAPIURL}`, updatedAgent)
    .then((res) => res.data);
};

/**
 * Deletes(removes) a queue agent by its ID.
 */
export const deleteQueueAgent = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};
