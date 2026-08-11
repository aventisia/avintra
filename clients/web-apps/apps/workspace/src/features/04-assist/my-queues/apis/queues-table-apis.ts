import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";
import { QueuesTableDto } from "../dtos/queues-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}`;

/**
 * Retrieves list of queues.
 */
const getQueues = () => {
  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(`${baseAPIURL}/queue/list`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves list of my queues.
 */
const getMyQueues = (dateRange?: { from?: Date; to?: Date }) => {
  const params = new URLSearchParams();
  if (dateRange?.from) params.set("from", dateRange.from.toISOString());
  if (dateRange?.to) params.set("to", dateRange.to.toISOString());
  const qs = params.toString();

  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(
      `${baseAPIURL}/queue-user/my-queues${qs ? `?${qs}` : ""}`,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Retrieves list of queues work items.
 */
const getQueuesWorkItemsList = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<QueueWorkItemDto[]>>(`${baseAPIURL}/queue/workitem/${id}/list`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves list of queues work items.
 */
const getQueueWorkItemById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<QueueWorkItemDto>>(`${baseAPIURL}/queue/workitem/${id}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing queue.
 */
const updateQueuesWorkItem = (updatedQueue: QueueWorkItemDto) => {
  return axiosInstance
    .put<IHttpResponse<QueueWorkItemDto>>(`${baseAPIURL}/queue/workitem`, updatedQueue, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

const routeQueuesWorkItem = (payload: { id: string; queueName: string }) => {
  return axiosInstance
    .put<IHttpResponse<QueueWorkItemDto>>(`${baseAPIURL}/queue/workitem/route`, payload, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Claims the next available work item for the given queue (FIFO mode only).
 */
const getNextQueuesWorkItem = (queueId: string) => {
  return axiosInstance
    .put<IHttpResponse<QueueWorkItemDto>>(
      `${baseAPIURL}/queue/workitem/next`,
      { queueId },
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

export {
  getQueues,
  getMyQueues,
  getQueuesWorkItemsList,
  getQueueWorkItemById,
  updateQueuesWorkItem,
  routeQueuesWorkItem,
  getNextQueuesWorkItem,
};
