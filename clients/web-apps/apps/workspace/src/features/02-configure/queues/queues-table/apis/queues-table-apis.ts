import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { QueueWorkItemDto } from "../../work-items-table/dtos/queue-work-item-dto";
import { QueuesTableDto } from "../dtos/queues-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/queue`;

/**
 * Retrieves list of queues.
 */
const getQueues = ({ isPersonal = true }: { isPersonal: boolean }) => {
  const path = isPersonal ? `list` : `list/shared`;
  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(`${baseAPIURL}/${path}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Checks the availability of a queue name.
 */
const isNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new queue.
 */
const insertQueue = (newqueue: QueuesTableDto) => {
  return axiosInstance
    .post<IHttpResponse<QueuesTableDto>>(`${baseAPIURL}`, newqueue, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new work item.
 */
const uploadWorkItem = (workitem: QueueWorkItemDto) => {
  return axiosInstance
    .post<IHttpResponse<QueueWorkItemDto>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/queue-transaction/multiple-data`,
      workitem,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * assign agents to the queue.
 */
//  const addTrigger = (assignAgentDto: AssignAgentDto) => {
//   return axiosInstance
//     .post<
//       IHttpResponse<boolean>
//     >(`${baseAPIURL}/${assignAgentDto.queueId}/add-trigger`, assignAgentDto.agentIds)
//     .then((res) => res.data);
// };

/**
 * Updates an existing queue.
 */
const updateQueue = (updatedqueue: QueuesTableDto) => {
  return axiosInstance
    .put<IHttpResponse<QueuesTableDto>>(`${baseAPIURL}`, updatedqueue, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes a queue by its ID.
 */
const deleteQueue = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Deletes multiple queues by their IDs.
 */
const deleteQueues = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

const searchQueues = (query: string = "") => {
  return axiosInstance
    .get<IHttpResponse<QueuesTableDto[]>>(`${baseAPIURL}/search/${query}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a queue based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<QueuesTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const queueOptimisticMutationFn = ({
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

export {
  getQueues,
  isNameAvailable,
  searchQueues,
  insertQueue,
  updateQueue,
  deleteQueue,
  deleteQueues,
  queueOptimisticMutationFn,
  uploadWorkItem,
};
