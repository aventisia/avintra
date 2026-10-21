import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { ConfigKeyValueDto } from "../dtos/config-key-value-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/config-store`;

/**
 * Retrieves list of personal+shared config key-value pairs and their values. Optionally can filter by specific keys.
 */
export const fetchConfigKeyValuePairs = (keys?: string[]) => {
  return axiosInstance
    .post<IHttpResponse<ConfigKeyValueDto[]>>(`${baseAPIURL}/fetch`, keys ?? [], {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};
