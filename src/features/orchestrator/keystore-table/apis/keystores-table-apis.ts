import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { KeystoresTableDto } from "../dtos/keystores-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/config-item`;

/**
 * Retrieves list of configs.
 */
const getKeystores = () => {
  return axiosInstance
    .get<IHttpResponse<KeystoresTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves list of configs.
 */
const getDecryptedKeystore = (rowId: string) => {
  return axiosInstance
    .get<IHttpResponse<string>>(`${baseAPIURL}/decrypt/${rowId}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a config name.
 */
const isKeystoreNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new config.
 */
const insertKeystore = (newConfig: KeystoresTableDto) => {
  return axiosInstance
    .post<IHttpResponse<KeystoresTableDto>>(`${baseAPIURL}`, newConfig)
    .then((res) => res.data);
};

/**
 * Updates an existing config.
 */
const updateKeystore = (updatedConfig: KeystoresTableDto) => {
  return axiosInstance
    .put<IHttpResponse<KeystoresTableDto>>(`${baseAPIURL}`, updatedConfig)
    .then((res) => res.data);
};

/**
 * Deletes a config by its ID.
 */
const deleteKeystore = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple configs by their IDs.
 */
const deleteKeystores = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a config based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<KeystoresTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const keystoreOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<KeystoresTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertKeystore(payload as KeystoresTableDto);
    case "update":
      return updateKeystore(payload as KeystoresTableDto);
    case "delete":
      return deleteKeystore(payload as string);
    case "delete-multiple":
      return deleteKeystores(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getKeystores,
  isKeystoreNameAvailable,
  insertKeystore,
  updateKeystore,
  deleteKeystore,
  deleteKeystores,
  keystoreOptimisticMutationFn,
  getDecryptedKeystore
};
