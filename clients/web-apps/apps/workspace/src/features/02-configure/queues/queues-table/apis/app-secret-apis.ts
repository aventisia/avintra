import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { CredSelectDto } from "../dtos/cred-select-dto.ts";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/vault-credential`;

const getCredSelectOptions = (type = "M365") => {
  // Build URL with optional query
  const queryURL = type ? `option-to-select?type=${type}` : `option-to-select`;

  return axiosInstance
    .get<IHttpResponse<CredSelectDto[]>>(`${baseAPIURL}/${queryURL}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

export { getCredSelectOptions };
