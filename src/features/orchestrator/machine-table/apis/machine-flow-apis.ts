import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { MachineFlowDto } from "../dtos/machine-flow-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/machine-flow`;

/**
 * Retrieves list of machineFlows.
 */
export const getMachineFlows = () => {
  return axiosInstance
    .get<IHttpResponse<MachineFlowDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves list of agents to assign to the machine.
 */
export const getAllAgents = () => {
  return axiosInstance
    .get<IHttpResponse<MachineFlowDto[]>>(`${baseAPIURL}/agent-list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a machineFlow name.
 */
export const isMachineFlowNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new machineFlow.
 */
export const insertMachineFlow = (newMachineFlow: MachineFlowDto) => {
  return axiosInstance
    .post<IHttpResponse<MachineFlowDto>>(`${baseAPIURL}`, newMachineFlow)
    .then((res) => res.data);
};

/**
 * Updates an existing machineFlow.
 */
export const updateMachineFlow = (updatedMachineFlow: MachineFlowDto) => {
  return axiosInstance
    .put<IHttpResponse<MachineFlowDto>>(`${baseAPIURL}`, updatedMachineFlow)
    .then((res) => res.data);
};

/**
 * Deletes a machineFlow by its ID.
 */
export const deleteMachineFlow = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple machineFlows by their IDs.
 */
export const deleteMachineFlows = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a machineFlow based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<MachineFlowDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const machineFlowOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<MachineFlowDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertMachineFlow(payload as MachineFlowDto);
    case "update":
      return updateMachineFlow(payload as MachineFlowDto);
    case "delete":
      return deleteMachineFlow(payload as string);
    case "delete-multiple":
      return deleteMachineFlows(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

