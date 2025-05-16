import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { SelectAgentTableDto } from "../dtos/select-agent-table-dto";
import { TriggersTableDto } from "../dtos/triggers-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/queue`;

/**
 * Retrieves list of triggers.
 */
export const getTriggers = () => {
  return axiosInstance
    .get<IHttpResponse<TriggersTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a trigger name.
 */
export const isNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new trigger.
 */
export const insertTrigger = (newtrigger: TriggersTableDto) => {
  return axiosInstance
    .post<IHttpResponse<TriggersTableDto>>(`${baseAPIURL}`, newtrigger)
    .then((res) => res.data);
};

/**
 * Updates an existing trigger.
 */
export const updateTrigger = (updatedtrigger: TriggersTableDto) => {
  return axiosInstance
    .put<IHttpResponse<TriggersTableDto>>(`${baseAPIURL}`, updatedtrigger)
    .then((res) => res.data);
};

/**
 * Deletes a trigger by its ID.
 */
export const deleteTrigger = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Retrieves list of agents of machine.
 */
export const geTriggerAgents = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<SelectAgentTableDto[]>>(`${baseAPIURL}/${id}/agents`)
    .then((res) => res.data);
};

/**
 * Deletes multiple triggers by their IDs.
 */
export const deleteTriggers = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a trigger based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<TriggersTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const triggerOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<TriggersTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertTrigger(payload as TriggersTableDto);
    case "update":
      return updateTrigger(payload as TriggersTableDto);
    case "delete":
      return deleteTrigger(payload as string);
    case "delete-multiple":
      return deleteTriggers(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
