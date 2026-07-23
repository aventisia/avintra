import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { MachineSearchResultDto } from "../dtos/machine-search-result.dto";
import { MachineSearchQueryFilters } from "../types/search-filters";

/**
 * Searches machines by unique name with an optional flow version filter.
 *
 * @param query - Search keyword for the machine name.
 * @param filters - Optional filters such as a linked flow version identifier.
 * @returns Service response containing matching machines.
 */
const searchMachines = (query: string = "", filters: MachineSearchQueryFilters) => {
  return axiosInstance
    .get<IHttpResponse<MachineSearchResultDto[]>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/search/machine`,
      {
        params: {
          query,
          flowVersionId: filters.flowVersionId,
        },
      },
    )
    .then((res) => res.data);
};

export { searchMachines };
