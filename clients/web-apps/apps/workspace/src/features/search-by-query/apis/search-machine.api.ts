import { IHttpResponse } from "@avplatform/ui/dtos";
import { ISelectOption } from "@avplatform/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { MachineSearchQueryFilters } from "../types/search-filters";

/**
 * Searches machines by unique name with an optional flow version filter.
 *
 * @param query - Search keyword for the machine name.
 * @param filters - Optional filters such as a linked flow version identifier.
 * @returns Service response containing matching machines as select options.
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
      },
    )
    .then((res) => res.data);
};

export { searchMachines };
