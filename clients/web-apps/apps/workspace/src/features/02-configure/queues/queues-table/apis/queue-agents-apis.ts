import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { QueueAgentsDto } from "../dtos/queue-agents-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/queue-agent`;

/**
 * Retrieves list of queue agents.
 */
const getQueueAgents = (queueId: string) => {
  return axiosInstance
    .get<IHttpResponse<QueueAgentsDto[]>>(`${baseAPIURL}/${queueId}/list`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts(Assign) a new queue agent.
 */
const insertQueueAgent = (queueAgent: QueueAgentsDto) => {
  return axiosInstance
    .post<IHttpResponse<QueueAgentsDto>>(`${baseAPIURL}`, queueAgent, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing queue agent.
 */
const updateQueueAgent = (updatedAgent: QueueAgentsDto) => {
  return axiosInstance
    .put<IHttpResponse<QueueAgentsDto>>(`${baseAPIURL}`, updatedAgent, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes(removes) a queue agent by its ID.
 */
const deleteQueueAgent = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

export { getQueueAgents, insertQueueAgent, updateQueueAgent, deleteQueueAgent };
