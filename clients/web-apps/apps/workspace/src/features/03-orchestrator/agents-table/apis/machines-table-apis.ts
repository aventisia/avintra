import { IHttpResponse } from "@avplatform/ui/dtos";

import { searchMachines } from "@/features/search-by-query/apis/search-machine.api";

import { AssignMachineDto } from "../dtos/assign-machine-dto";

/**
 * Searches for machines using the SearchByQuery feature and adapts the
 * select-option results into the AssignMachineDto shape consumed by the
 * assign-machine UI.
 *
 * @param searchKey - Keyword to filter machines by unique name.
 */
const findMachinesByKeyword = async (searchKey: string) => {
  const response = await searchMachines(searchKey, { flowVersionId: null });

  const adaptedData: AssignMachineDto[] = (response?.data ?? []).map((machine) => ({
    id: machine.value ?? "",
    tenantId: "",
    agentId: "",
    name: machine.label ?? "",
    isDisabled: false,
    type: undefined,
    isAssigned: false,
    osId: undefined,
    status: machine.description as AssignMachineDto["status"],
  }));

  return {
    ...response,
    data: adaptedData,
  } as IHttpResponse<AssignMachineDto[]>;
};

export { findMachinesByKeyword };
