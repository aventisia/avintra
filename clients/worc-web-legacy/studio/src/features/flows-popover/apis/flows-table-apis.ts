import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { IOptimisticMutation } from "@aventisia/ui/dtos";
import { CheckAvailabilityDto } from "@aventisia/ui/dtos";
import { TrueFalseResultDto } from "@aventisia/ui/dtos";

import { FlowsTableDto } from "../dtos/flows-table-dto";

/* Note: File name is flows-table-apis.ts instead of flows-popover-apis.ts because 
  its a copy of flows-table feature of workspace app and both will be using the 
  same api endpoints so any change to the apis is going to affect both the files. 
  So, we just need to replace the file in future.
*/

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow`;

/**
 * Retrieves all flows created by the user
 */
const getFlows = () => {
  return axiosInstance
    .get<IHttpResponse<FlowsTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a flow name.
 */
const isFlowNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new flow.
 */
const insertFlow = (newFlow: FlowsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<FlowsTableDto>>(`${baseAPIURL}`, newFlow)
    .then((res) => res.data);
};

/**
 * Updates an existing flow.
 */
const updateFlow = (updatedFlow: FlowsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<FlowsTableDto>>(`${baseAPIURL}`, updatedFlow)
    .then((res) => res.data);
};

/**
 * Deletes a flow by its ID.
 */
const deleteFlow = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple Flows by their IDs.
 */
const deleteFlows = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a flow based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<FlowsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const flowOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<FlowsTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertFlow(payload as FlowsTableDto);
    case "update":
      return updateFlow(payload as FlowsTableDto);
    case "delete":
      return deleteFlow(payload as string);
    case "delete-multiple":
      return deleteFlows(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getFlows,
  isFlowNameAvailable,
  insertFlow,
  updateFlow,
  deleteFlow,
  deleteFlows,
  flowOptimisticMutationFn,
};
