import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { MachineDto } from "../dtos/machine-dto";
import { MachineAssignAgentDto } from '../dtos/machine-assign-agent-dto';
import type { AssignAgentDto } from "../dtos/assign-agent-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/machine`;

/**
 * Retrieves list of machines.
 */
export const getMachines = () => {
  return axiosInstance
    .get<IHttpResponse<MachineDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a machine name.
 */
export const isMachineNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new machine.
 */
export const insertMachine = (newMachine: MachineDto) => {
  return axiosInstance
    .post<IHttpResponse<MachineDto>>(`${baseAPIURL}`, newMachine)
    .then((res) => res.data);
};

/**
 * Updates an existing machine.
 */
export const updateMachine = (updatedMachine: MachineDto) => {
  return axiosInstance
    .put<IHttpResponse<MachineDto>>(`${baseAPIURL}`, updatedMachine)
    .then((res) => res.data);
};

/**
 * Deletes a machine by its ID.
 */
export const deleteMachine = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple machines by their IDs.
 */
export const deleteMachines = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Retrieves list of select options to assign a agent to machine.
 */
export const getAssignableAgents = (machineId: string) => {
  return axiosInstance
    .get<IHttpResponse<AssignAgentDto[]>>(`${baseAPIURL}/${machineId}/agents`)
    .then((res) => res.data);
};

/**
 * assign agents to the machine.
 */
export const assignAgents = (assignAgentDto: MachineAssignAgentDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/${assignAgentDto.machineId}/assign-agent`, assignAgentDto.agentIds)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a machine based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<MachineDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const machineOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<MachineDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertMachine(payload as MachineDto);
    case "update":
      return updateMachine(payload as MachineDto);
    case "delete":
      return deleteMachine(payload as string);
    case "delete-multiple":
      return deleteMachines(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

