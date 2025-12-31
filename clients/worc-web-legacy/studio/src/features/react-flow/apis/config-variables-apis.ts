import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { ConfigVariablesDto } from "../dtos/config-variables-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_URL}/key-store`;

/**
 * Retrieves list of keystores.
 */
export const getConfigVariables = () => {
  return axiosInstance
    .get<IHttpResponse<ConfigVariablesDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};
