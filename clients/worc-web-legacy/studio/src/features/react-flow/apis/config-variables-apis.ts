import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { ConfigVariablesDto } from "../dtos/config-variables-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/key-store`;

/**
 * Retrieves list of keystores.
 */
export const getConfigVariables = () => {
  return axiosInstance
    .get<IHttpResponse<ConfigVariablesDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};
