import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { VaultCredentialSelectDto } from "../dtos/vault-credential-select.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/vault-credential`;

// IMPORTANT NOTE: stored trigger/queue providers still carry the pre-flattening family
// names; the vault now stores per-service types (M365 -> Outlook, Google Workspace -> Gmail).
const LEGACY_CREDENTIAL_TYPE_MAP: Record<string, string> = {
  M365: "Outlook",
  "Microsoft 365": "Outlook",
  GoogleWorkspace: "Gmail",
};

const getVaultCredentialSelectOptions = (type = "M365") => {
  const credentialType = LEGACY_CREDENTIAL_TYPE_MAP[type] ?? type;
  // Build URL with optional query
  const queryURL = credentialType ? `option-to-select?type=${credentialType}` : `option-to-select`;

  return axiosInstance
    .get<IHttpResponse<VaultCredentialSelectDto[]>>(`${baseAPIURL}/${queryURL}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

export { getVaultCredentialSelectOptions };
