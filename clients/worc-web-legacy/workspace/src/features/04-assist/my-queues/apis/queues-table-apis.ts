import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";
import { QueuesTableDto } from "../dtos/queues-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}`;

/**
 * Retrieves list of queues.
 */
const getQueues = () => {
  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(`${baseAPIURL}/queue/list`)
    .then((res) => res.data);
};

/**
 * Retrieves list of my queues.
 */
const getMyQueues = () => {
  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(`${baseAPIURL}/queue-user/my-queues`)
    .then((res) => res.data);
};

/**
 * Retrieves list of queues work items.
 */
const getQueuesWorkItemsList = (id: string) => {
  return axiosInstance
    .get<
      IHttpResponse<QueueWorkItemDto[]>
    >(`${baseAPIURL}/queue/workitem/${id}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves list of queues work items.
 */
const getQueueWorkItemById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<QueueWorkItemDto>>(`${baseAPIURL}/queue/workitem/${id}`)
    .then((res) => res.data);
};

/**
 * Updates an existing queue.
 */
const updateQueuesWorkItem = (updatedQueue: QueueWorkItemDto) => {
  return axiosInstance
    .put<
      IHttpResponse<QueueWorkItemDto>
    >(`${baseAPIURL}/queue/workitem`, updatedQueue)
    .then((res) => res.data);
};

const routeQueuesWorkItem = (payload: { id: string; queueName: string }) => {
  return axiosInstance
    .put<
      IHttpResponse<QueueWorkItemDto>
    >(`${baseAPIURL}/queue/workitem/route`, payload)
    .then((res) => res.data);
};

export {
  getQueues,
  getMyQueues,
  getQueuesWorkItemsList,
  getQueueWorkItemById,
  updateQueuesWorkItem,
  routeQueuesWorkItem,
};
