import {
    IHttpResponse,
    IOptimisticMutation,
  } from "@aventisia/ui/dtos";
  
  import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { HistoryTableDTO } from "../dtos/history-table-dto";
  
  

const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}`;
  
  /**
   * Retrieves all fine tune history records
   */
  const getHistoryRecords = (modelId: string, modelName: string) => {
    return axiosInstance
      .get<IHttpResponse<HistoryTableDTO[]>>(`${baseAPIURL}/${modelName}/fine-tuning/histories/${modelId}`)
      .then((res) => res.data);
  };

    /**
     * Deletes a record by its ID.
     */
    const deleteHistoryRecord = (id: string) => {
      return axiosInstance
        .delete<IHttpResponse<boolean>>(`${baseAPIURL}/fine-tuning/histories/${id}`)
        .then((res) => res.data);
    };

     /**
       * Performs an optimistic mutation on a model based on the provided CRUD action.
       *
       * @param {IOptimisticMutation<ModelsTableDto | string | string[]>} options - The options for the optimistic mutation.
       * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
       * @throws {Error} - If an invalid action type is provided.
       */
      const historyOptimisticMutationFn = ({
        payload,
        crudAction,
      }: IOptimisticMutation<HistoryTableDTO | string | string[]>) => {
        switch (crudAction) {
          case "delete":
            return deleteHistoryRecord(payload as string);
          default:
            throw new Error("Invalid record type");
        }
      };


  export {getHistoryRecords, historyOptimisticMutationFn, deleteHistoryRecord}