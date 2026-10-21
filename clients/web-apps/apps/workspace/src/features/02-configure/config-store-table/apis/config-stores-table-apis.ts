import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { ConfigStoresTableDto } from "../dtos/config-stores-table-dto";

export const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/config-store`;

/**
 * Retrieves list of config stores.
 */
export const getConfigStore = ({ isPersonal = true }: { isPersonal: boolean }) => {
  const path = isPersonal ? `list` : `list/shared`;
  return axiosInstance
    .get<IHttpResponse<ConfigStoresTableDto[]>>(`${baseAPIURL}/${path}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves list of config stores.
 */
export const getDecryptedKey = (rowId: string) => {
  return axiosInstance
    .get<IHttpResponse<string>>(`${baseAPIURL}/decrypt/${rowId}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Checks the availability of a config store name.
 */
export const isConfigStoreNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new config store.
 */
export const insertConfigStore = (newConfigStore: ConfigStoresTableDto) => {
  return axiosInstance
    .post<IHttpResponse<ConfigStoresTableDto>>(`${baseAPIURL}`, newConfigStore, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing config store.
 */
export const updateConfigStore = (updatedConfigStore: ConfigStoresTableDto) => {
  return axiosInstance
    .put<IHttpResponse<ConfigStoresTableDto>>(`${baseAPIURL}`, updatedConfigStore, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes a config store by its ID.
 */
export const deleteConfigStore = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Deletes multiple config stores by their IDs.
 */
export const deleteConfigStores = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a config store based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<ConfigStoresTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const configStoreOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<ConfigStoresTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertConfigStore(payload as ConfigStoresTableDto);
    case "update":
      return updateConfigStore(payload as ConfigStoresTableDto);
    case "delete":
      return deleteConfigStore(payload as string);
    case "delete-multiple":
      return deleteConfigStores(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
