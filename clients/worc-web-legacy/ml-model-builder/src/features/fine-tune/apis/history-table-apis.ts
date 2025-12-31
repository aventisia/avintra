import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse, IOptimisticMutation } from "@aventisia/ui/dtos";

import { HistoryTableDTO } from "../dtos/history-table-dto";
import { ReScheduleFineTuneDTO } from "../dtos/reschedule-fine-tune-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}`;

/**
 * Retrieves all fine tune history records
 */
const getHistoryRecords = (modelId: string, modelName: string) => {
  return axiosInstance
    .get<
      IHttpResponse<HistoryTableDTO[]>
    >(`${baseAPIURL}/${modelName}/fine-tuning/histories/${modelId}`)
    .then((res) => res.data);
};

/**
 * Deletes a record by its ID.
 */
const deleteHistoryRecord = ({
  id,
  modelName,
}: {
  id: string;
  modelName: string;
}) => {
  return axiosInstance
    .delete<
      IHttpResponse<boolean>
    >(`${baseAPIURL}/${modelName}/fine-tuning/histories/${id}`)
    .then((res) => res.data);
};

const rescheduleFineTune = (
  fineTuneData: ReScheduleFineTuneDTO,
  modelName: string,
) => {
  return axiosInstance
    .post<
      IHttpResponse<ReScheduleFineTuneDTO>
    >(`${baseAPIURL}/${modelName}/reschedule-fine-tuning`, fineTuneData)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a model based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<HistoryTableDTO | { id: string; modelName: string } | string[]>} options
 * @returns {Promise<any>}
 */
const historyOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<
  HistoryTableDTO | { id: string; modelName: string } | string[]
>) => {
  switch (crudAction) {
    case "delete":
      return deleteHistoryRecord(payload as { id: string; modelName: string });
    default:
      throw new Error("Invalid CRUD action");
  }
};

export {
  getHistoryRecords,
  historyOptimisticMutationFn,
  deleteHistoryRecord,
  rescheduleFineTune,
};
