import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { CredSelectDto } from "../dtos/cred-select-dto.ts.ts";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/app-secret`;

const getCredSelectOptions = (query?: string) => {
  // Build URL with optional query
  const queryURL = query
    ? `option-to-select?type=${query}`
    : `option-to-select`;

  return axiosInstance
    .get<IHttpResponse<CredSelectDto[]>>(`${baseAPIURL}/${queryURL}`)
    .then((res) => res.data);
};

export { getCredSelectOptions };
