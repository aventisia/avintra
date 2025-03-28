import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { QueuesTableDto } from "../dtos/queues-table-dto";
import { QueueCreateUpdateDto } from "../dtos/queue-create-update-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/queue`;

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
export const insertQueue = (newqueue: QueueCreateUpdateDto) => {
  return axiosInstance
    .post<IHttpResponse<QueueCreateUpdateDto>>(`${baseAPIURL}`, newqueue, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

/**
 * Updates an existing queue.
 */
export const updateQueue = (updatedqueue: QueueCreateUpdateDto) => {
  return axiosInstance
    .put<IHttpResponse<QueueCreateUpdateDto>>(`${baseAPIURL}`, updatedqueue, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
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
}: IOptimisticMutation<QueueCreateUpdateDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertQueue(payload as QueueCreateUpdateDto);
    case "update":
      return updateQueue(payload as QueueCreateUpdateDto);
    case "delete":
      return deleteQueue(payload as string);
    case "delete-multiple":
      return deleteQueues(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
