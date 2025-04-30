import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { ModelsTableDto } from "../dtos/models-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_MODEL_STUDIO_API_URL}/ml-model`;

/**
 * Retrieves all ai models created by user
 */
const getModels = () => {
  return axiosInstance
    .get<IHttpResponse<ModelsTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Get model by id.
 */
const getModel = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<ModelsTableDto[]>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Inserts a new model.
 */
const insertModel = (newModel: ModelsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<ModelsTableDto>>(`${baseAPIURL}`, newModel)
    .then((res) => res.data);
};

/**
 * Updates an existing model.
 */
const updateModel = (updatedModel: ModelsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<ModelsTableDto>>(`${baseAPIURL}`, updatedModel)
    .then((res) => res.data);
};

/**
 * Deletes a model by its ID.
 */
const deleteModel = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple models by their IDs.
 */
const deleteModels = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Checks the availability of a model name.
 */
const isModelNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a model based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<ModelsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const modelOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<ModelsTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertModel(payload as ModelsTableDto);
    case "update":
      return updateModel(payload as ModelsTableDto);
    case "delete":
      return deleteModel(payload as string);
    case "delete-multiple":
      return deleteModels(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  deleteModel,
  deleteModels,
  getModel,
  getModels,
  insertModel,
  isModelNameAvailable,
  modelOptimisticMutationFn,
  updateModel,
};
