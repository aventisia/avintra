import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";
import { ISelectOption } from "@avplatform/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { type VaultCredentialScope } from "../contexts/vault-credential-scope.context";
import { VaultCredentialDto } from "../dtos/vault-credentials.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/vault-credential`;
const tenantBaseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/tenant-vault-credential`;

/**
 * Retrieves the tenant-level vault credentials; admin only.
 */
export const getTenantVaultCredentials = () => {
  return axiosInstance
    .get<IHttpResponse<VaultCredentialDto[]>>(`${tenantBaseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves tenant-level vault credentials, optionally of one type, as select options; admin only.
 */
export const getSelectableTenantVaultCredentialOptions = (type?: string) => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${tenantBaseAPIURL}/option-to-select`, {
      params: { type },
    })
    .then((res) => res.data);
};

/**
 * Checks whether a vault credential name is free across the tenant and every space.
 */
export const isTenantVaultCredentialNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${tenantBaseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new tenant-level vault credential.
 */
export const createTenantVaultCredential = (newConfig: VaultCredentialDto) => {
  return axiosInstance
    .post<IHttpResponse<VaultCredentialDto>>(`${tenantBaseAPIURL}`, newConfig)
    .then((res) => res.data);
};

/**
 * Updates an existing tenant-level vault credential.
 */
export const updateTenantVaultCredential = (updatedConfig: VaultCredentialDto) => {
  return axiosInstance
    .put<IHttpResponse<VaultCredentialDto>>(`${tenantBaseAPIURL}`, updatedConfig)
    .then((res) => res.data);
};

/**
 * Deletes an existing tenant-level vault credential.
 */
export const deleteTenantVaultCredential = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${tenantBaseAPIURL}/${id}`)
    .then((res) => res.data);
};

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

const tenantVaultCredentialOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<VaultCredentialDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return createTenantVaultCredential(payload as VaultCredentialDto);
    case "update":
      return updateTenantVaultCredential(payload as VaultCredentialDto);
    case "delete":
      return deleteTenantVaultCredential(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};

/**
 * The vault credential API calls for each credential scope.
 */
export const vaultCredentialScopeApis = {
  space: {
    isNameAvailable: isVaultCredentialNameAvailable,
    create: createVaultCredential,
    update: updateVaultCredential,
    optimisticMutationFn: vaultCredentialOptimisticMutationFn,
  },
  tenant: {
    isNameAvailable: isTenantVaultCredentialNameAvailable,
    create: createTenantVaultCredential,
    update: updateTenantVaultCredential,
    optimisticMutationFn: tenantVaultCredentialOptimisticMutationFn,
  },
} satisfies Record<VaultCredentialScope, object>;
