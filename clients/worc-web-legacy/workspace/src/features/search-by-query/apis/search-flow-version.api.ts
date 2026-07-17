import { IHttpResponse } from "@aventisia/ui/dtos";

import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { FlowVersionSearchResultDto } from "../dtos/flow-version-search-result.dto";

/**
 * Searches flow versions.
 *
 * @param query - Search keyword.
 * @param type - Optional flow type to filter results (default: Agent).
 * @param includePublishedOnly - Whether to include only published flow versions (default: true).
 * @returns Service response containing matching flow versions.
 */
const searchFlowVersions = (
  query: string = "",
  type: FlowTypesEnum = FlowTypesEnum.Agent,
  includePublishedOnly: boolean = true,
) => {
  return axiosInstance
    .get<IHttpResponse<FlowVersionSearchResultDto[]>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/search/flow-version`,
      {
        params: {
          query,
          type,
          includePublishedOnly,
        },
      },
    )
    .then((res) => res.data);
};

export { searchFlowVersions };
