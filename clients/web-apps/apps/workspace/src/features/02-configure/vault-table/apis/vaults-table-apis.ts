import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { VaultsTableDto } from "../dtos/vaults-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/app-secret`;

/**
 * Retrieves list of configs.
 */
export const getVaults = ({ isPersonal = true }: { isPersonal: boolean }) => {
  const path = isPersonal ? `list` : `list/shared`;

  return axiosInstance
    .get<IHttpResponse<VaultsTableDto[]>>(`${baseAPIURL}/${path}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Retrieves list of configs.
 */
export const getDecryptedVault = (rowId: string) => {
  return axiosInstance
    .get<IHttpResponse<string>>(`${baseAPIURL}/decrypt/${rowId}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Checks the availability of a config name.
 */
export const isVaultNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new config.
 */
export const insertVault = (newConfig: VaultsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<VaultsTableDto>>(`${baseAPIURL}`, newConfig, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing config.
 */
export const updateVault = (updatedConfig: VaultsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<VaultsTableDto>>(`${baseAPIURL}`, updatedConfig, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes a config by its ID.
 */
export const deleteVault = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Deletes multiple configs by their IDs.
 */
export const deleteVaults = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Mints a Corsair OAuth connect link for an App Secret.
 */
export const createOAuthConnectLink = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<{ connectUrl: string }>>(`${baseAPIURL}/${id}/connect-link`, undefined, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Gets the Corsair OAuth connection status for an App Secret.
 */
export const getOAuthConnectionStatus = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<{ connected: boolean; state: string }>>(`${baseAPIURL}/${id}/oauth-status`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

export const testCorsairCredential = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<{ status: string; reason?: string }>>(`${baseAPIURL}/${id}/connection-test`, undefined, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a config based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<VaultsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const vaultOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<VaultsTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertVault(payload as VaultsTableDto);
    case "update":
      return updateVault(payload as VaultsTableDto);
    case "delete":
      return deleteVault(payload as string);
    case "delete-multiple":
      return deleteVaults(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
