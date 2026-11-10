import type { IOptimisticMutation } from "@avplatform/ui/dtos";
import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { AgentAssignMachineDto } from "../dtos/agent-assign-machine-dto";
import { AgentsTableDto } from "../dtos/agents-table-dto";
import { AssignMachineDto } from "../dtos/assign-machine-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/agent`;

/**
 * Retrieves all published agents.
 */
export const getPublishedAgents = () => {
  // Fetch agents from API
  return axiosInstance
    .get<IHttpResponse<AgentsTableDto[]>>(`${baseAPIURL}/published`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

export const getSearchPublishedAgents = (query: string) => {
  // Fetch agents from API
  return axiosInstance
    .get<IHttpResponse<AgentsTableDto[]>>(`${baseAPIURL}/search/${query}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves list of select options to assign a machine to agent.
 */
export const getAssignedMachines = (flowVersionId: string) => {
  return axiosInstance
    .get<IHttpResponse<AssignMachineDto[]>>(`${baseAPIURL}/${flowVersionId}/machines`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * assign machines to the agent
 */
export const assignMachines = (assignMachineDto: AgentAssignMachineDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(
      `${baseAPIURL}/${assignMachineDto.flowVersionId}/assign-machines`,
      assignMachineDto.machineIds,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Updates an existing project.
 */
export const updateAgent = (updatedAgent: AgentsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<AgentsTableDto>>(`${baseAPIURL}`, updatedAgent, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes a Agent by its ID.
 */
const deleteAgent = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-version/delete/${id}`,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Deletes multiple Agents by their IDs.
 */
const deleteAgents = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

export const disableMachines = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/disable-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a Agent based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<ProjectsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const AgentOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<AgentsTableDto | string | string[] | AgentAssignMachineDto>) => {
  switch (crudAction) {
    case "update":
      return assignMachines(payload as AgentAssignMachineDto);
    case "delete":
      return deleteAgent(payload as string);
    case "delete-multiple":
      return deleteAgents(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
