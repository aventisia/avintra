import { IHttpResponse } from "../dtos/http-response";
import { axiosInstance } from "../lib/axios-instance";
import { ISelectOption } from "../types/select-option";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/tenant`;

export const getTenantsToSelect = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/tenants-to-select`)
    .then((res) => res.data);
};
