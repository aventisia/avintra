import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { AgentsTableDto } from "../dtos/agents-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/agent`;

/**
 * Retrieves all agents associated with a machine.
 */
export const getMachineAgents = (machineId?: string) => {
  // Return if machineId is not provided (machineId can be null if not passed in query params)
  if (!machineId) return Promise.resolve(null);

  // Fetch agents from API
  return axiosInstance
    .get<IHttpResponse<AgentsTableDto[]>>(`${baseAPIURL}/list/${machineId}`)
    .then((res) => res.data);
};

/**
 * Retrieves all published agents.
 */
export const getPublishedAgents = () => {
  // Fetch agents from API
  return axiosInstance
    .get<IHttpResponse<AgentsTableDto[]>>(`${baseAPIURL}/publish-flows/`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a agent name.
 */
export const isAgentNameAvailable = (
  machineId: string,
  postObj: CheckAvailabilityDto,
) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available/${machineId}`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new agent.
 */
export const insertAgent = (newAgent: AgentsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<AgentsTableDto>>(`${baseAPIURL}`, newAgent)
    .then((res) => res.data);
};

/**
 * Updates an existing agent.
 */
export const updateAgent = (updatedAgent: AgentsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<AgentsTableDto>>(`${baseAPIURL}`, updatedAgent)
    .then((res) => res.data);
};

/**
 * Deletes a agent by its ID.
 */
export const deleteAgent = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple Agents by their IDs.
 */
export const deleteAgents = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a agent based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<AgentsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const agentOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<AgentsTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertAgent(payload as AgentsTableDto);
    case "update":
      return updateAgent(payload as AgentsTableDto);
    case "delete":
      return deleteAgent(payload as string);
    case "delete-multiple":
      return deleteAgents(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

