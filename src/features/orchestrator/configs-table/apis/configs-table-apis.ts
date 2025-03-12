import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { ConfigsTableDto } from "../dtos/configs-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/config-item`;

/**
 * Retrieves list of configs.
 */
const getConfigs = () => {
  return axiosInstance
    .get<IHttpResponse<ConfigsTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves list of configs.
 */
const getDecryptedConfig = (rowId: string) => {
  return axiosInstance
    .get<IHttpResponse<ConfigsTableDto>>(`${baseAPIURL}/decrypt/${rowId}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a config name.
 */
const isConfigNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new config.
 */
const insertConfig = (newConfig: ConfigsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<ConfigsTableDto>>(`${baseAPIURL}`, newConfig)
    .then((res) => res.data);
};

/**
 * Updates an existing config.
 */
const updateConfig = (updatedConfig: ConfigsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<ConfigsTableDto>>(`${baseAPIURL}`, updatedConfig)
    .then((res) => res.data);
};

/**
 * Deletes a config by its ID.
 */
const deleteConfig = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple configs by their IDs.
 */
const deleteConfigs = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a config based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<ConfigsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const configOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<ConfigsTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertConfig(payload as ConfigsTableDto);
    case "update":
      return updateConfig(payload as ConfigsTableDto);
    case "delete":
      return deleteConfig(payload as string);
    case "delete-multiple":
      return deleteConfigs(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getConfigs,
  isConfigNameAvailable,
  insertConfig,
  updateConfig,
  deleteConfig,
  deleteConfigs,
  configOptimisticMutationFn,
  getDecryptedConfig
};
