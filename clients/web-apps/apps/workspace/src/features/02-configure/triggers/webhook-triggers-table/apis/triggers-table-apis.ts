import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { SearchAgentsDto } from "../dtos/search-agent-dto";
import { SelectAgentTableDto } from "../dtos/select-agent-table-dto";
import { WebhookTriggerDto } from "../dtos/webhook-trigger-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/webhook-trigger`;

/**
 * Retrieves list of triggers.
 */
export const getTriggers = ({ isPersonal = true }: { isPersonal: boolean }) => {
  const path = isPersonal ? `list` : `list/shared`;
  return axiosInstance
    .get<IHttpResponse<WebhookTriggerDto[]>>(`${baseAPIURL}/${path}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Checks the availability of a trigger name.
 */
export const isNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new trigger.
 */
export const insertTrigger = (newtrigger: WebhookTriggerDto) => {
  return axiosInstance
    .post<IHttpResponse<WebhookTriggerDto>>(`${baseAPIURL}`, newtrigger, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing trigger.
 */
export const updateTrigger = (updatedtrigger: WebhookTriggerDto) => {
  return axiosInstance
    .put<IHttpResponse<WebhookTriggerDto>>(`${baseAPIURL}`, updatedtrigger, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes a trigger by its ID.
 */
export const deleteTrigger = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Retrieves list of select options to assign a agent to  new trigger.
 */
export const getNewTriggerAgents = () => {
  return axiosInstance
    .get<IHttpResponse<SelectAgentTableDto[]>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/agent/publish-flows`,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Retrieves list of agents of machine.
 */
export const geTriggerAgents = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<SearchAgentsDto[]>>(`${baseAPIURL}/${id}/agents`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes multiple triggers by their IDs.
 */
export const deleteTriggers = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a trigger based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<WebhookTriggerDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const triggerOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<WebhookTriggerDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertTrigger(payload as WebhookTriggerDto);
    case "update":
      return updateTrigger(payload as WebhookTriggerDto);
    case "delete":
      return deleteTrigger(payload as string);
    case "delete-multiple":
      return deleteTriggers(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
