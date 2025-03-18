import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { VaultsTableDto } from "../dtos/vaults-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/config-item`;

/**
 * Retrieves list of configs.
 */
const getVaults = () => {
  return axiosInstance
    .get<IHttpResponse<VaultsTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves list of configs.
 */
const getDecryptedVault = (rowId: string) => {
  return axiosInstance
    .get<IHttpResponse<string>>(`${baseAPIURL}/decrypt/${rowId}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a config name.
 */
const isVaultNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new config.
 */
const insertVault = (newConfig: VaultsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<VaultsTableDto>>(`${baseAPIURL}`, newConfig)
    .then((res) => res.data);
};

/**
 * Updates an existing config.
 */
const updateVault = (updatedConfig: VaultsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<VaultsTableDto>>(`${baseAPIURL}`, updatedConfig)
    .then((res) => res.data);
};

/**
 * Deletes a config by its ID.
 */
const deleteVault = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple configs by their IDs.
 */
const deleteVaults = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a config based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<VaultsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const vaultOptimisticMutationFn = ({
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

export {
  getVaults,
  isVaultNameAvailable,
  insertVault,
  updateVault,
  deleteVault,
  deleteVaults,
  vaultOptimisticMutationFn,
  getDecryptedVault
};
