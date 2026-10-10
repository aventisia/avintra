import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import type { MachineRecordDto } from "../dtos/machine-record.dto";
import { MachinesTableRowDto } from "../dtos/machines-table-row-dto";
import type { UpdateMachineDto } from "../dtos/update-machine.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/machine`;

/**
 * Retrieves list of machines.
 *
 * NOTE: We need to pass the X-Space-Id so that the agent count reflects the
 * current space only. Machines are shared across spaces, so without the header
 * the list resolves to the Central space.
 */
const getMachines = () => {
  return axiosInstance
    .get<IHttpResponse<MachinesTableRowDto[]>>(`${baseAPIURL}/list`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieve machine by its ID.
 *
 * NOTE: We need to pass the X-Space-Id so that we can filter the flow version
 * those belongs to current space only. to see other space's linked flow version
 * user has to switch the space
 */
const getMachine = (machineId: string) => {
  return axiosInstance
    .get<IHttpResponse<MachineRecordDto>>(`${baseAPIURL}/${machineId}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing machine.
 */
const updateMachine = (updateMachineDto: UpdateMachineDto) => {
  return axiosInstance
    .put<IHttpResponse<MachinesTableRowDto>>(`${baseAPIURL}`, updateMachineDto, {
      headers: getSpaceHeaders(),
    })
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

export { getMachines, getMachine, updateMachine, deleteMachine, deleteMachines };
