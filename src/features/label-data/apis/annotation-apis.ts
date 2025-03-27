import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { AnnotationDataDto } from "../dtos/annotation-data-dtos";

const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/extracted-data`;

/**
 * Retrieves list of annotations.
 */
const getAnnotationList = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<AnnotationDataDto[]>>(`${baseAPIURL}/list/${modelId}`)
    .then((res) => res.data);
};

/**
 * Get annotation by id.
 */
const getAnnotationById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<AnnotationDataDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Inserts a new annotation object for doc.
 */
const insertAnnotationData = (dataField: AnnotationDataDto) => {
  return axiosInstance
    .post<IHttpResponse<AnnotationDataDto>>(`${baseAPIURL}`, dataField)
    .then((res) => res.data);
};

/**
 * Updates an existing annotation object.
 */
const updateAnnotationData = (data: AnnotationDataDto) => {
  return axiosInstance
    .put<IHttpResponse<AnnotationDataDto>>(`${baseAPIURL}`, data)
    .then((res) => res.data);
};

/**
 * Deletes a annotation by using model ID.
 */
const deleteAnnotationData = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a annotation based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<AnnotationDataDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const annotationOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<AnnotationDataDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertAnnotationData(payload as AnnotationDataDto);
    case "update":
      return updateAnnotationData(payload as AnnotationDataDto);
    case "delete":
      return deleteAnnotationData(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getAnnotationById,
  getAnnotationList,
  insertAnnotationData,
  updateAnnotationData,
  deleteAnnotationData,
  annotationOptimisticMutationFn,
};
