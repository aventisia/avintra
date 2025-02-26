import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { DataFieldsDto } from "../dtos/data-fields-dtos";

const baseAPIURL: string = `${import.meta.env.VITE_ML_MODELBUILDER_API_URL}/data-field`;

/**
 * Retrieves list of models.
 */
const getDataFields = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<DataFieldsDto[]>>(`${baseAPIURL}/list/${modelId}`)
    .then((res) => res.data);
};

/**
 * Get model by id.
 */
const getDataField = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<DataFieldsDto[]>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Inserts a new model to library.
 */
const insertDataField = (dataField: DataFieldsDto) => {
  return axiosInstance
    .post<IHttpResponse<DataFieldsDto>>(`${baseAPIURL}`, dataField)
    .then((res) => res.data);
};

/**
 * Updates an existing model.
 */
const updateDataField = (dataField: DataFieldsDto) => {
  return axiosInstance
    .put<IHttpResponse<DataFieldsDto>>(`${baseAPIURL}`, dataField)
    .then((res) => res.data);
};

/**
 * Deletes a model by its ID.
 */
const deleteDataField = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple models by their IDs.
 */
const deleteDataFields = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a model based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<DataFieldsDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const dataFieldOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<DataFieldsDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertDataField(payload as DataFieldsDto);
    case "update":
      return updateDataField(payload as DataFieldsDto);
    case "delete":
      return deleteDataField(payload as string);
    case "delete-multiple":
      return deleteDataFields(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getDataField,
  getDataFields,
  insertDataField,
  updateDataField,
  deleteDataField,
  deleteDataFields,
  dataFieldOptimisticMutationFn,
};
