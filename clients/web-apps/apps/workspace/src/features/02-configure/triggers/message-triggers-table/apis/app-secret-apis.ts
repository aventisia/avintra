import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { CredSelectDto } from "../dtos/cred-select-dto.ts.ts";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/app-secret`;

const getCredSelectOptions = (query?: string) => {
  // Build URL with optional query
  const queryURL = query ? `option-to-select?type=${query}` : `option-to-select`;

  return axiosInstance
    .get<IHttpResponse<CredSelectDto[]>>(`${baseAPIURL}/${queryURL}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

export { getCredSelectOptions };
