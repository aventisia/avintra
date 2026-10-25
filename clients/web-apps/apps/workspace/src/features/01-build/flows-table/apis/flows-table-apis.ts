import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { FlowsTableDto } from "../dtos/flows-table-dto";
import { UpdateFlowFolderDto } from "../dtos/update-flow-folder.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow`;

/**
 * Retrieves all flows created by the user, optionally including archived agents.
 */
const getFlows = ({
  isPersonal = true,
  includeArchived = false,
}: {
  isPersonal: boolean;
  includeArchived?: boolean;
}) => {
  const path = isPersonal ? `list` : `list/shared`;
  return axiosInstance
    .get<IHttpResponse<FlowsTableDto[]>>(`${baseAPIURL}/${path}`, {
      headers: getSpaceHeaders(),
      params: { includeArchived },
    })
    .then((res) => res.data);
};

/**
 * Checks the availability of a flow name.
 */
const isFlowNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new flow.
 */
const insertFlow = (newFlow: FlowsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<FlowsTableDto>>(`${baseAPIURL}`, newFlow, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Updates an existing flow.
 */
const updateFlow = (updatedFlow: FlowsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<FlowsTableDto>>(`${baseAPIURL}`, updatedFlow, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Moves an existing flow into a folder, or to the top level when no folder is given.
 */
const updateFlowFolder = (updateFlowFolderDto: UpdateFlowFolderDto) => {
  return axiosInstance
    .put<IHttpResponse<boolean>>(`${baseAPIURL}/folder`, updateFlowFolderDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes a flow by its ID.
 */
const deleteFlow = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Deletes multiple Flows by their IDs.
 */
const deleteFlows = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
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
  updateFlowFolder,
  deleteFlow,
  deleteFlows,
  flowOptimisticMutationFn,
};
