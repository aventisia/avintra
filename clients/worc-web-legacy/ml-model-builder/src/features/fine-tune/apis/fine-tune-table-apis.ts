import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse, IOptimisticMutation } from "@aventisia/ui/dtos";

import { FineTuneTableDTO } from "../dtos/fine-tune-table-dto";
import { ScheduleFineTuneDTO } from "../dtos/schedule-fine-tune-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_PATH}`;

/**
 * Retrieves all fine tune records
 */
const getFineTuneRecords = (modelId: string, modelName: string) => {
  return axiosInstance
    .get<
      IHttpResponse<FineTuneTableDTO[]>
    >(`${baseAPIURL}/${modelName}/fine-tuning/${modelId}`)
    .then((res) => res.data);
};

/**
 * Schedule Fine Tune
 */
const scheduleFineTune = (
  fineTuneData: ScheduleFineTuneDTO,
  modelName: string,
) => {
  return axiosInstance
    .post<
      IHttpResponse<ScheduleFineTuneDTO>
    >(`${baseAPIURL}/${modelName}/schedule-fine-tuning`, fineTuneData)
    .then((res) => res.data);
};

/**
 * Deletes a record by its ID.
 */
const deleteRecord = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/extracted-data/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple records by their IDs.
 */
const deleteRecords = (ids: string[]) => {
  return axiosInstance
    .post<
      IHttpResponse<boolean>
    >(`${baseAPIURL}/extracted-data/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a model based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<ModelsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const fineTuneOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<FineTuneTableDTO | string | string[]>) => {
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
  getFineTuneRecords,
  fineTuneOptimisticMutationFn,
  deleteRecord,
  deleteRecords,
  scheduleFineTune,
};
