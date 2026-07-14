import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@aventisia/ui/dtos";
import { ISelectOption } from "@aventisia/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { AssignMachineDto } from "../../agents-table/dtos/assign-machine-dto";
import type { UpdateMachineFlowVersionsDto } from "../dtos/assign-agent-dto";
import type { AddMachineDto } from "../dtos/add-machine.dto";
import { MachinesTableDto } from "../dtos/machines-table-dto";
import type { SelectAgentTableDto } from "../dtos/select-agent-table-dto";
import type { UpdateMachineDto } from "../dtos/update-machine.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/machine`;

/**
 * Retrieves list of machines.
 */
const getMachines = () => {
  return axiosInstance
    .get<IHttpResponse<MachinesTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieve machine by its ID.
 */
const getMachine = (machineId: string) => {
  return axiosInstance
    .get<IHttpResponse<MachinesTableDto>>(`${baseAPIURL}/${machineId}`)
    .then((res) => res.data);
};

/**
 * Inserts a new machine.
 */
const insertMachine = (addMachineDto: AddMachineDto) => {
  return axiosInstance
    .post<IHttpResponse<MachinesTableDto>>(`${baseAPIURL}`, addMachineDto)
    .then((res) => res.data);
};

/**
 * Updates an existing machine.
 */
const updateMachine = (updateMachineDto: UpdateMachineDto) => {
  return axiosInstance
    .put<IHttpResponse<MachinesTableDto>>(`${baseAPIURL}`, updateMachineDto)
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
 * Synchronizes flow versions assigned to a machine.
 */
const syncMachineFlowVersions = (
  updateMachineFlowVersionsDto: UpdateMachineFlowVersionsDto,
) => {
  return axiosInstance
    .post<
      IHttpResponse<boolean>
    >(`${baseAPIURL}/sync-flow-versions`, updateMachineFlowVersionsDto)
    .then((res) => res.data);
};

/**
 * Retrieves flow versions assigned to a machine by OS identifier.
 */
const getFlowVersionsByMachineOSId = (osID: string) => {
  return axiosInstance
    .get<
      IHttpResponse<SelectAgentTableDto[]>
    >(`${baseAPIURL}/${osID}/flow-versions`)
    .then((res) => res.data);
};

/**
 * Retrieves the select-option list of machines.
 */
const getMachineSelectOptions = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/select-option`)
    .then((res) => res.data);
};

/**
 * Searches for machines based on the specified search keyword.
 * Adapts results into AssignMachineDto shape for assign-machine consumers.
 */
const findMachinesByKeyword = (searchKey: string) => {
  return axiosInstance
    .get<IHttpResponse<MachinesTableDto[]>>(`${baseAPIURL}/search/${searchKey}`)
    .then((res) => {
      const adaptedData: AssignMachineDto[] = (res.data?.data ?? []).map(
        (machine) => ({
          id: machine.id ?? "",
          tenantId: machine.tenantId ?? "",
          agentId: "",
          name: machine.name,
          isDisabled: machine.isDisabled ?? false,
          createdBy: machine.createdBy ?? "",
          createdOn: machine.createdOn
            ? new Date(machine.createdOn)
            : new Date(),
          lastModifiedBy: machine.lastModifiedBy ?? "",
          lastModifiedOn: machine.lastModifiedOn
            ? new Date(machine.lastModifiedOn)
            : new Date(),
          type: machine.operatingSystem,
          environment: machine.environment,
          isAssigned: false,
          osId: machine.osID,
          status: machine.status,
        }),
      );

      return {
        ...res.data,
        data: adaptedData,
      } as IHttpResponse<AssignMachineDto[]>;
    });
};

/**
 * Retrieves list of select options to assign an agent to a new machine.
 * @deprecated Uses a separate agent endpoint; not part of MachineController.
 */
const getNewMachineAgents = () => {
  return axiosInstance
    .get<
      IHttpResponse<SelectAgentTableDto[]>
    >(`${import.meta.env.VITE_WORKSPACE_API_PATH}/agent/publish-flows`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a machine name.
 * @deprecated No matching backend endpoint in MachineController.
 */
const isMachineNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a machine based on the provided CRUD action.
 * Maps MachinesTableDto payload to the appropriate request DTO for each action.
 *
 * @param {IOptimisticMutation<MachinesTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const machineOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<
  AddMachineDto | UpdateMachineDto | string | string[]
>) => {
  switch (crudAction) {
    case "create": {
      return insertMachine(payload as AddMachineDto);
    }
    case "update": {
      return updateMachine(payload as UpdateMachineDto);
    }
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
  getMachine,
  insertMachine,
  updateMachine,
  deleteMachine,
  deleteMachines,
  syncMachineFlowVersions,
  getFlowVersionsByMachineOSId,
  getMachineSelectOptions,
  findMachinesByKeyword,
  getNewMachineAgents,
  isMachineNameAvailable,
  machineOptimisticMutationFn,
};
