import { IHttpResponse } from "@avplatform/ui/dtos";
import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { ISelectOption } from "@avplatform/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { FlowVersionSearchQueryFilters } from "../types/search-filters";

/**
 * Searches flow versions.
 *
 * @param query - Search keyword.
 * @param type - Optional flow type to filter results (default: Agent).
 * @param includePublishedOnly - Whether to include only published flow versions (default: true).
 * @param filters - Optional filters such as a linked machine identifier.
 * @returns Service response containing matching flow versions as select options.
 */
const searchFlowVersions = (
  query: string = "",
  type: FlowTypesEnum = FlowTypesEnum.Agent,
  includePublishedOnly: boolean = true,
  filters: FlowVersionSearchQueryFilters = { machineId: null },
) => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/search/flow-version`,
      {
        params: {
          query,
          type,
          includePublishedOnly,
          machineId: filters.machineId,
        },
      },
    )
    .then((res) => res.data);
};

export { searchFlowVersions };
