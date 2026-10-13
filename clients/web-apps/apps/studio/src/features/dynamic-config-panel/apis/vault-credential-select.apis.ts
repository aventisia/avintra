import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { VaultCredentialSelectDto } from "../dtos/vault-credential-select.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/vault-credential`;

const getVaultCredentialSelectOptions = (query?: string) => {
  // Build URL with optional query
  const queryURL = query ? `option-to-select?type=${query}` : `option-to-select`;

  return axiosInstance
    .get<IHttpResponse<VaultCredentialSelectDto[]>>(`${baseAPIURL}/${queryURL}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

export { getVaultCredentialSelectOptions };
