import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@aventisia/ui/dtos";

import { AssignMachineDto } from "../../agents-table/dtos/assign-machine-dto";
import type { AssignAgentDto } from "../dtos/assign-agent-dto";
import { MachinesTableDto } from "../dtos/machines-table-dto";
import type { SelectAgentTableDto } from "../dtos/select-agent-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/machine`;

/**
 * Retrieves list of machines.
 */
const getMachines = () => {
  return axiosInstance
    .get<IHttpResponse<MachinesTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

export const getSearchMachines = (query: string) => {
  // Fetch agents from API
  return axiosInstance
    .get<IHttpResponse<AssignMachineDto[]>>(`${baseAPIURL}/search/${query}`)
    .then((res) => res.data);
};

/**
 * Retrieves list of agents of machine.
 */
export const getMachineAgents = (machineId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<SelectAgentTableDto[]>
    >(`${baseAPIURL}/${machineId}/agents`)
    .then((res) => res.data);
};

/**
 * assign agents to the machine.
 */
export const assignAgents = (assignAgentDto: AssignAgentDto) => {
  return axiosInstance
    .post<
      IHttpResponse<boolean>
    >(`${baseAPIURL}/${assignAgentDto.machineId}/assign-agent`, assignAgentDto.agentIds)
    .then((res) => res.data);
};

/**
 * Retrieves list of select options to assign a agent to  new machine.
 */
export const getNewMachineAgents = () => {
  return axiosInstance
    .get<
      IHttpResponse<SelectAgentTableDto[]>
    >(`${import.meta.env.VITE_WORKSPACE_API_PATH}/agent/publish-flows`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a machine name.
 */
const isMachineNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new machine.
 */
const insertMachine = (newMachine: MachinesTableDto) => {
  return axiosInstance
    .post<IHttpResponse<MachinesTableDto>>(`${baseAPIURL}`, newMachine)
    .then((res) => res.data);
};

/**
 * Updates an existing machine.
 */
const updateMachine = (updatedMachine: MachinesTableDto) => {
  return axiosInstance
    .put<IHttpResponse<MachinesTableDto>>(`${baseAPIURL}`, updatedMachine)
    .then((res) => res.data);
};

/**
 * Deletes a machine by its ID.
 */
const deleteMachine = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple machines by their IDs.
 */
const deleteMachines = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a machine based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<MachinesTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const machineOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<MachinesTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertMachine(payload as MachinesTableDto);
    case "update":
      return updateMachine(payload as MachinesTableDto);
    case "delete":
      return deleteMachine(payload as string);
    case "delete-multiple":
      return deleteMachines(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getMachines,
  isMachineNameAvailable,
  insertMachine,
  updateMachine,
  deleteMachine,
  deleteMachines,
  machineOptimisticMutationFn,
};
