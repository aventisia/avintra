import { CheckAvailabilityDto, IHttpResponse, TrueFalseResultDto } from "@aventisia/ui/dtos";
import { ISelectOption } from "@aventisia/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { AssignMachineDto } from "../../agents-table/dtos/assign-machine-dto";
import type { AddMachineDto } from "../dtos/add-machine.dto";
import type { MachineRecordDto } from "../dtos/machine-record.dto";
import { MachinesTableRowDto } from "../dtos/machines-table-row-dto";
import type { SelectAgentTableDto } from "../dtos/select-agent-table-dto";
import type { UpdateMachineDto } from "../dtos/update-machine.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/machine`;

/**
 * Retrieves list of machines.
 */
const getMachines = () => {
  return axiosInstance
    .get<IHttpResponse<MachinesTableRowDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieve machine by its ID.
 */
const getMachine = (machineId: string) => {
  return axiosInstance
    .get<IHttpResponse<MachineRecordDto>>(`${baseAPIURL}/${machineId}`)
    .then((res) => res.data);
};

/**
 * Inserts a new machine
 */
const insertMachine = (addMachineDto: AddMachineDto) => {
  return axiosInstance
    .post<IHttpResponse<MachinesTableRowDto>>(`${baseAPIURL}`, addMachineDto)
    .then((res) => res.data);
};

/**
 * Updates an existing machine.
 */
const updateMachine = (updateMachineDto: UpdateMachineDto) => {
  return axiosInstance
    .put<IHttpResponse<MachinesTableRowDto>>(`${baseAPIURL}`, updateMachineDto)
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
    .post<IHttpResponse<number>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * For insert or update machine optimistic mutation
 */
const insertOrUpdateMachine = (mutateObj: AddMachineDto | UpdateMachineDto) => {
  if ("id" in mutateObj) return updateMachine(mutateObj as UpdateMachineDto);
  else return insertMachine(mutateObj as AddMachineDto);
};

/**
 * Retrieves flow versions assigned to a machine by OS identifier.
 */
const getFlowVersionsByMachineOSId = (osID: string) => {
  return axiosInstance
    .get<IHttpResponse<SelectAgentTableDto[]>>(`${baseAPIURL}/${osID}/flow-versions`)
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
    .get<IHttpResponse<MachinesTableRowDto[]>>(`${baseAPIURL}/search/${searchKey}`)
    .then((res) => {
      const adaptedData: AssignMachineDto[] = (res.data?.data ?? []).map((machine) => ({
        id: machine.id ?? "",
        tenantId: "",
        agentId: "",
        name: machine.name,
        isDisabled: machine.isDisabled ?? false,
        createdBy: machine.createdBy ?? "",
        createdOn: machine.createdOn ? new Date(machine.createdOn) : new Date(),
        lastModifiedBy: machine.lastModifiedBy ?? "",
        lastModifiedOn: machine.lastModifiedOn ? new Date(machine.lastModifiedOn) : new Date(),
        type: machine.operatingSystem,
        environment: machine.environment,
        isAssigned: false,
        osId: machine.osID,
        status: machine.status,
      }));

      return {
        ...res.data,
        data: adaptedData,
      } as IHttpResponse<AssignMachineDto[]>;
    });
};

/**
 * Retrieves list of select options to assign an agent to a new machine.
 * @deprecated Uses a separate agent endpoint; not part of MachinesTableController.
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
 * @deprecated No matching backend endpoint in MachinesTableController.
 */
const isMachineNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

export {
  getMachines,
  getMachine,
  insertMachine,
  updateMachine,
  deleteMachine,
  deleteMachines,
  insertOrUpdateMachine,
  getFlowVersionsByMachineOSId,
  getMachineSelectOptions,
  findMachinesByKeyword,
  getNewMachineAgents,
  isMachineNameAvailable,
};
