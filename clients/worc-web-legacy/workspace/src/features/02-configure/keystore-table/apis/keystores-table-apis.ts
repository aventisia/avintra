import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { KeystoresTableDto } from "../dtos/keystores-table-dto";

export const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/key-store`;

/**
 * Retrieves list of keystores.
 */
export const getKeystore = () => {
  return axiosInstance
    .get<IHttpResponse<KeystoresTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves list of keystores.
 */
export const getDecryptedKey = (rowId: string) => {
  return axiosInstance
    .get<IHttpResponse<string>>(`${baseAPIURL}/decrypt/${rowId}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a keystore name.
 */
export const isKeystoreNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new keystore.
 */
export const insertKeystore = (newKeystore: KeystoresTableDto) => {
  return axiosInstance
    .post<IHttpResponse<KeystoresTableDto>>(`${baseAPIURL}`, newKeystore)
    .then((res) => res.data);
};

/**
 * Updates an existing keystore.
 */
export const updateKeystore = (updatedKeystore: KeystoresTableDto) => {
  return axiosInstance
    .put<IHttpResponse<KeystoresTableDto>>(`${baseAPIURL}`, updatedKeystore)
    .then((res) => res.data);
};

/**
 * Deletes a keystore by its ID.
 */
export const deleteKeystore = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple keystores by their IDs.
 */
export const deleteKeystores = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a keystore based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<KeystoresTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const keystoreOptimisticMutationFn = ({
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
