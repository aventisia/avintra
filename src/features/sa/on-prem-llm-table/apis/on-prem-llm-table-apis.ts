import { IHttpResponse, IOptimisticMutation } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { OnPremLLMTableDTO } from "../dtos/on-prem-llm-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_URL}/on-prem-llm`;

/**
 * Retrieves all On Prem LLM
 */
const getOnPremLLMList = () => {
  return axiosInstance
    .get<IHttpResponse<OnPremLLMTableDTO[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Get On Prem LLM
 */
const getOnPremLLM = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<OnPremLLMTableDTO>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Inserts a new COn Prem LLM
 */
const insertOnPremLLM = (newOnPremLLM: OnPremLLMTableDTO) => {
  return axiosInstance
    .post<IHttpResponse<OnPremLLMTableDTO>>(`${baseAPIURL}`, newOnPremLLM)
    .then((res) => res.data);
};

/**
 * Updates an existing On Prem LLM
 */
const updateOnPremLLM = (updateOnPremLLM: OnPremLLMTableDTO) => {
  return axiosInstance
    .put<IHttpResponse<OnPremLLMTableDTO>>(`${baseAPIURL}`, updateOnPremLLM)
    .then((res) => res.data);
};

/**
 * Uninstall a On Prem LLM by it's id
 */
const uninstallOnPremLLM = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Uninstall multiple On Prem LLM by their ids
 */
const uninstallOnPremLLMs = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a model based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<ModelsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const onPremLLMOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<OnPremLLMTableDTO | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertOnPremLLM(payload as OnPremLLMTableDTO);
    case "update":
      return updateOnPremLLM(payload as OnPremLLMTableDTO);
    case "delete":
      return uninstallOnPremLLM(payload as string);
    case "delete-multiple":
      return uninstallOnPremLLMs(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getOnPremLLM,
  getOnPremLLMList,
  insertOnPremLLM,
  updateOnPremLLM,
  uninstallOnPremLLM,
  uninstallOnPremLLMs,
  onPremLLMOptimisticMutationFn,
};
