import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";
import { ISelectOption } from "@avplatform/ui/types";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { MachineSearchQueryFilters } from "../types/machine-search-filters.type";

/**
 * Searches machines by unique name with an optional flow version filter.
 */
const searchMachines = (query: string = "", filters: MachineSearchQueryFilters) => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/search/machine`,
      {
        params: {
          query,
          flowVersionId: filters.flowVersionId,
        },
        headers: getStudioSpaceHeaders(),
      },
    )
    .then((res) => res.data);
};

export { searchMachines };
