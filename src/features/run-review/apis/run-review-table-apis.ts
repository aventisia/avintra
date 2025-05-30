import {
    IHttpResponse,
    IOptimisticMutation,
  } from "@aventisia/ui/dtos";
  
  import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { RunReviewTableDTO } from "@/features/run-review/dtos/run-review-table-dto";
  
  
  
const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}`;
  
  /**
   * Retrieves all ai models created by user
   */
  const getRunReviewRecords = (modelId: string, modelName: string) => {
    return axiosInstance
      .get<IHttpResponse<RunReviewTableDTO[]>>(`${baseAPIURL}/${modelName}/review-data/${modelId}`)
      .then((res) => res.data);
  };
  
  /**
   * Inserts a new model.
   */
//   const insertModel = (newModel: ModelsTableDto) => {
//     return axiosInstance
//       .post<IHttpResponse<ModelsTableDto>>(`${baseAPIURL}`, newModel)
//       .then((res) => res.data);
//   };
  
  /**
   * Updates an existing model.
   */
//   const updateModel = (updatedModel: ModelsTableDto) => {
//     return axiosInstance
//       .put<IHttpResponse<ModelsTableDto>>(`${baseAPIURL}`, updatedModel)
//       .then((res) => res.data);
//   };
  
  /**
   * Deletes a model by its ID.
   */
  const deleteRecord = (id: string) => {
    return axiosInstance
      .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
      .then((res) => res.data);
  };
  
  /**
   * Deletes multiple models by their IDs.
   */
  const deleteRecords = (ids: string[]) => {
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
  const runReviewOptimisticMutationFn = ({
    payload,
    crudAction,
  }: IOptimisticMutation<RunReviewTableDTO | string | string[]>) => {
    switch (crudAction) {
    //   case "create":
    //     // return insertModel(payload as ModelsTableDto);
    //   case "update":
    //     // return updateModel(payload as ModelsTableDto);
      case "delete":
        return deleteRecord(payload as string);
      case "delete-multiple":
        return deleteRecords(payload as string[]);
      default:
        throw new Error("Invalid record type");
    }
  };
  
  export {
    // deleteModel,
    // deleteModels,
    // getModel,
    // getModels,
    // insertModel,
    // isModelNameAvailable,
    getRunReviewRecords,
    runReviewOptimisticMutationFn,
    deleteRecord,
    deleteRecords
    // updateModel,
  };
  