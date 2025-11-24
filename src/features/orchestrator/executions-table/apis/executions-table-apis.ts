import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { ExecutionsTableDto } from "../dtos/executions-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_URL}/job`;

/**
 * Retrieves list of Executions.
 */
export const getExecutions = () => {
  return axiosInstance
    .get<IHttpResponse<ExecutionsTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a Execution name.
 */
export const isNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new Execution.
 */
export const insertExecution = (newExecution: ExecutionsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<ExecutionsTableDto>>(`${baseAPIURL}`, newExecution)
    .then((res) => res.data);
};

/**
 * retry the failed execution
 */
export const retryExecution = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/${id}/retry`)
    .then((res) => res.data);
};

/**
 * retry the failed execution
 */
export const retryExecutions = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/retry`, ids)
    .then((res) => res.data);
};

/**
 * cancel the running execution
 */
export const cancelExecution = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/${id}/cancel`)
    .then((res) => res.data);
};

/**
 * Updates an existing Execution.
 */
export const updateExecution = (updatedExecution: ExecutionsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<ExecutionsTableDto>>(`${baseAPIURL}`, updatedExecution)
    .then((res) => res.data);
};

/**
 * Deletes a Execution by its ID.
 */
export const deleteExecution = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple Executions by their IDs.
 */
export const deleteExecutions = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a Execution based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<ExecutionsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const ExecutionOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<ExecutionsTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertExecution(payload as ExecutionsTableDto);
    case "update":
      return updateExecution(payload as ExecutionsTableDto);
    case "delete":
      return deleteExecution(payload as string);
    case "delete-multiple":
      return deleteExecutions(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
