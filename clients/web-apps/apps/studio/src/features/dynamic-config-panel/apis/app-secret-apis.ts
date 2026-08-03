import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { CredSelectDto } from "../dtos/cred-select-dto.ts.ts";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/app-secret`;

const getCredSelectOptions = (query?: string) => {
  // Build URL with optional query
  const queryURL = query ? `option-to-select?type=${query}` : `option-to-select`;

  return axiosInstance
    .get<IHttpResponse<CredSelectDto[]>>(`${baseAPIURL}/${queryURL}`)
    .then((res) => res.data);
};

export { getCredSelectOptions };
