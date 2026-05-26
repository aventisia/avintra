import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { QueueWorkItemDto } from "../../work-items-table/dtos/queue-work-item-dto";
import { QueuesTableDto } from "../dtos/queues-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/queue`;

/**
 * Retrieves list of queues.
 */
export const getQueues = () => {
  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a queue name.
 */
export const isNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new queue.
 */
export const insertQueue = (newqueue: QueuesTableDto) => {
  return axiosInstance
    .post<IHttpResponse<QueuesTableDto>>(`${baseAPIURL}`, newqueue)
    .then((res) => res.data);
};

/**
 * Inserts a new work item.
 */
export const uploadWorkItem = (workitem: QueueWorkItemDto) => {
  return axiosInstance
    .post<
      IHttpResponse<QueueWorkItemDto>
    >(`${import.meta.env.VITE_WORC_API_PATH}/queue-transaction/multiple-data`, workitem)
    .then((res) => res.data);
};

/**
 * assign agents to the queue.
 */
// export const addTrigger = (assignAgentDto: AssignAgentDto) => {
//   return axiosInstance
//     .post<
//       IHttpResponse<boolean>
//     >(`${baseAPIURL}/${assignAgentDto.queueId}/add-trigger`, assignAgentDto.agentIds)
//     .then((res) => res.data);
// };

/**
 * Updates an existing queue.
 */
export const updateQueue = (updatedqueue: QueuesTableDto) => {
  return axiosInstance
    .put<IHttpResponse<QueuesTableDto>>(`${baseAPIURL}`, updatedqueue)
    .then((res) => res.data);
};

/**
 * Deletes a queue by its ID.
 */
export const deleteQueue = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple queues by their IDs.
 */
export const deleteQueues = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a queue based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<QueuesTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const queueOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<QueuesTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertQueue(payload as QueuesTableDto);
    case "update":
      return updateQueue(payload as QueuesTableDto);
    case "delete":
      return deleteQueue(payload as string);
    case "delete-multiple":
      return deleteQueues(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
