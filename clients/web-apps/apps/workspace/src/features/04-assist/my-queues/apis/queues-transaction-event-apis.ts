import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { QueueTransactionEventDto } from "../dtos/queue-transaction-event-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/queue/transaction-events`;

/**
 * Retrieves list of queues workItem events.
 */
export const getQueueWorkItemEventsById = (workItemId: string) => {
  return axiosInstance
    .get<IHttpResponse<QueueTransactionEventDto[]>>(`${baseAPIURL}/${workItemId}/list`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new queue workItem event.
 */
export const insertQueueWorkItemEvent = (dto: QueueTransactionEventDto) => {
  return axiosInstance
    .post<IHttpResponse<QueueTransactionEventDto>>(`${baseAPIURL}`, dto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Update a queue workItem event.
 */
export const updateQueueWorkItemEvent = (dto: QueueTransactionEventDto) => {
  return axiosInstance
    .put<IHttpResponse<QueueTransactionEventDto>>(`${baseAPIURL}`, dto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
