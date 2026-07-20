import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import type { AddMachineDto } from "../dtos/add-machine.dto";
import type { MachineRecordDto } from "../dtos/machine-record.dto";
import { MachinesTableRowDto } from "../dtos/machines-table-row-dto";
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

export {
  getMachines,
  getMachine,
  insertMachine,
  updateMachine,
  deleteMachine,
  deleteMachines,
  insertOrUpdateMachine,
};
