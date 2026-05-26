import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";
import { QueuesTableDto } from "../dtos/queues-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}`;

/**
 * Retrieves list of queues.
 */
export const getQueues = () => {
  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(`${baseAPIURL}/queue/list`)
    .then((res) => res.data);
};

/**
 * Retrieves list of my queues.
 */
export const getMyQueues = () => {
  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(`${baseAPIURL}/queue-user/my-queues`)
    .then((res) => res.data);
};

/**
 * Retrieves list of queues work items.
 */
export const getQueuesWorkItemsList = (id: string) => {
  return axiosInstance
    .get<
      IHttpResponse<QueueWorkItemDto[]>
    >(`${baseAPIURL}/queue-transaction/list/${id}`)
    .then((res) => res.data);
};

/**
 * Inserts a new queue.
 */
export const insertQueuesWorkItems = (dto: QueueWorkItemDto) => {
  return axiosInstance
    .post<
      IHttpResponse<QueueWorkItemDto>
    >(`${baseAPIURL}/queue-transaction`, dto)
    .then((res) => res.data);
};

/**
 * Updates an existing queue.
 */
export const updateQueuesWorkItems = (updatedqueue: QueueWorkItemDto) => {
  return axiosInstance
    .put<
      IHttpResponse<QueueWorkItemDto>
    >(`${baseAPIURL}/queue-transaction`, updatedqueue)
    .then((res) => res.data);
};

/**
 * Deletes a queue by its ID.
 */
export const deleteQueuesWorkItem = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/queue-transaction/${id}`)
    .then((res) => res.data);
};
