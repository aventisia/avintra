import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { AssignMachineDto } from "../../agents-table/dtos/assign-machine-dto";
import { MachinesTableRowDto } from "../../machines-table/dtos/machines-table-row-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/machine`;

// TODO: Need to implement it correctly in future. 

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

export { findMachinesByKeyword };
