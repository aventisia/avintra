import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { ConfigKeyValueDto } from "../dtos/config-key-value-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/key-store`;

/**
 * Retrieves list of personal+shared config key-value pairs and their values. Optionally can filter by specific keys.
 */
export const fetchConfigKeyValuePairs = (keys?: string[]) => {
  return axiosInstance
    .post<IHttpResponse<ConfigKeyValueDto[]>>(`${baseAPIURL}/fetch`, keys ?? [])
    .then((res) => res.data);
};
