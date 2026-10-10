import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { VaultCredentialDto } from "../dtos/vaults-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/vault/credentials`;

/**
 * Retrieves list of vault credentials.
 */
export const getVaultCredentials = ({ isPersonal = true }: { isPersonal: boolean }) => {
  const path = isPersonal ? `list` : `list/shared`;

  return axiosInstance
    .get<IHttpResponse<VaultCredentialDto[]>>(`${baseAPIURL}/${path}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Checks whether a vault credential name is available.
 */
export const isVaultCredentialNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Insert a new vault credential.
 */
export const createVaultCredential = (newConfig: VaultCredentialDto) => {
  return axiosInstance
    .post<IHttpResponse<VaultCredentialDto>>(`${baseAPIURL}`, newConfig, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing vault credential.
 */
export const updateVaultCredential = (updatedConfig: VaultCredentialDto) => {
  return axiosInstance
    .put<IHttpResponse<VaultCredentialDto>>(`${baseAPIURL}`, updatedConfig, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes an existing vault credential.
 */
export const deleteVaultCredential = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Deletes multiple vault credentials by their IDs.
 */
export const deleteMultipleVaultCredentials = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<number>>(`${baseAPIURL}/delete-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Creates a Corsair OAuth connect link for a vault credential.
 */
export const createOAuthConnectLink = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<{ connectUrl: string }>>(`${baseAPIURL}/${id}/connect-link`, undefined, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves the Corsair OAuth connection status for a vault credential.
 */
export const getOAuthConnectionStatus = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<{ connected: boolean; state: string }>>(`${baseAPIURL}/${id}/oauth-status`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Tests a Corsair vault credential connection.
 */
export const testCorsairCredential = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<{ status: string; reason?: string }>>(
      `${baseAPIURL}/${id}/connection-test`,
      undefined,
      {
        headers: getSpaceHeaders(),
      },
    )
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a vault credential for the given CRUD action.
 */
export const vaultCredentialOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<VaultCredentialDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return createVaultCredential(payload as VaultCredentialDto);
    case "update":
      return updateVaultCredential(payload as VaultCredentialDto);
    case "delete":
      return deleteVaultCredential(payload as string);
    case "delete-multiple":
      return deleteMultipleVaultCredentials(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
