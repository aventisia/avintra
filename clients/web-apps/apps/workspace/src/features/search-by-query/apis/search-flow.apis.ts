import { IHttpResponse } from "@avplatform/ui/dtos";
import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { FlowSearchOptionDto } from "../dtos/flow-search-option.dto";

/**
 * Searches flows by name.
 */
const searchFlow = (query: string = "", types?: FlowTypesEnum[]) => {
  return axiosInstance
    .get<IHttpResponse<FlowSearchOptionDto[]>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/search/flow`,
      {
        params: {
          query,
          types,
        },
        // IMPORTANT NOTE: Send `types=A&types=B` rather than `types[]=A`, which ASP.NET Core does not bind.
        paramsSerializer: { indexes: null },
        headers: getSpaceHeaders(),
      },
    )
    .then((res) => res.data);
};

export { searchFlow };
