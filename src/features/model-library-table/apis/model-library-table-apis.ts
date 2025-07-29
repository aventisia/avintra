import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { IOptimisticMutation } from "@aventisia/ui/dtos";
import { CheckAvailabilityDto } from "@aventisia/ui/dtos";
import { TrueFalseResultDto } from "@aventisia/ui/dtos";

import { ModelLibraryTableDto } from "../dtos/model-library-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/ml-model`;

/**
 * Retrieves list of models.
 */
const getModels = () => {
  return axiosInstance
    .get<IHttpResponse<ModelLibraryTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Get model by id.
 */
const getModel = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<ModelLibraryTableDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Inserts a new model to library.
 */
const insertModel = (newModel: ModelLibraryTableDto) => {
  return axiosInstance
    .post<IHttpResponse<ModelLibraryTableDto>>(`${baseAPIURL}`, newModel)
    .then((res) => res.data);
};

/**
 * Updates an existing model.
 */
const updateModel = (updatedModel: ModelLibraryTableDto) => {
  return axiosInstance
    .put<IHttpResponse<ModelLibraryTableDto>>(`${baseAPIURL}`, updatedModel)
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
    >(`${baseAPIURL}/IsMLModelNameAvailable`, postObj)
    .then((res) => res.data);
};

/**
 * Publish an existing model.
 */
const publishModel = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<ModelLibraryTableDto>>(`${baseAPIURL}/publish/${id}`)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a model based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<ModelLibraryTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const modelOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<ModelLibraryTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertModel(payload as ModelLibraryTableDto);
    case "update":
      return updateModel(payload as ModelLibraryTableDto);
    case "delete":
      return deleteModel(payload as string);
    case "delete-multiple":
      return deleteModels(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getModel,
  getModels,
  insertModel,
  updateModel,
  deleteModel,
  deleteModels,
  publishModel,
  isModelNameAvailable,
  modelOptimisticMutationFn,
};
