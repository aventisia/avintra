import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse, IOptimisticMutation } from "@aventisia/ui/dtos";

import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/queue-transaction`;

/**
 * Retrieves list of queues work items by the queue id.
 */
export const getQueuesWorkItemPayload = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<QueueWorkItemDto>>(`${baseAPIURL}/payload/${id}`)
    .then((res) => res.data);
};

/**
 * Retrieves list of queues work items.
 */
export const getQueuesWorkItemsList = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<QueueWorkItemDto[]>>(`${baseAPIURL}/list/${id}`)
    .then((res) => res.data);
};

/**
 * Inserts a new queue.
 */
export const insertQueuesWorkItems = (dto: QueueWorkItemDto) => {
  return axiosInstance
    .post<IHttpResponse<QueueWorkItemDto>>(`${baseAPIURL}`, dto)
    .then((res) => res.data);
};

/**
 * Updates an existing queue.
 */
export const updateQueuesWorkItems = (updatedqueue: QueueWorkItemDto) => {
  return axiosInstance
    .put<IHttpResponse<QueueWorkItemDto>>(`${baseAPIURL}`, updatedqueue)
    .then((res) => res.data);
};

/**
 * Deletes a queue by its ID.
 */
export const deleteQueuesWorkItem = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple queues by their IDs.
 */
export const deleteQueuesWorkItems = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a queue based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<QueueWorkItemDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const workItemsOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<QueueWorkItemDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertQueuesWorkItems(payload as QueueWorkItemDto);
    case "update":
      return updateQueuesWorkItems(payload as QueueWorkItemDto);
    case "delete":
      return deleteQueuesWorkItem(payload as string);
    case "delete-multiple":
      return deleteQueuesWorkItems(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
