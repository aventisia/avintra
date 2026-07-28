import { axiosInstance } from "@avplatform/ui/lib";

import { IHttpResponse } from "@avplatform/ui/dtos";
import { IOptimisticMutation } from "@avplatform/ui/dtos";

import { FlowCommentDto } from "../dtos/flow-comment-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-comment`;

/**
 * Gets single flow comment to edit the comment
 */
const getFlowComment = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<FlowCommentDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Gets list of flow comments of single flow using flow Id.
 */
const getFlowComments = (flowId: string) => {
  return axiosInstance
    .get<IHttpResponse<FlowCommentDto[]>>(`${baseAPIURL}/list/${flowId}`)
    .then((res) => res.data);
};

/**
 * Creates a new flow commment
 */
const insertFlowComment = (newFlowComment: FlowCommentDto) => {
  return axiosInstance
    .post<IHttpResponse<FlowCommentDto>>(`${baseAPIURL}`, newFlowComment)
    .then((res) => res.data);
};

/**
 * Update the flow comment with IsEdited flag
 */
const updateFlowComment = (updatedFlowComment: FlowCommentDto) => {
  return axiosInstance
    .put<IHttpResponse<FlowCommentDto>>(`${baseAPIURL}`, updatedFlowComment)
    .then((res) => res.data);
};

/**
 * Deletes flow comment permanently
 */
const deleteFlowComment = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a flow comment based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<FlowCommentDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const flowCommentOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<FlowCommentDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertFlowComment(payload as FlowCommentDto);
    case "update":
      return updateFlowComment(payload as FlowCommentDto);
    case "delete":
      return deleteFlowComment(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getFlowComment,
  getFlowComments,
  insertFlowComment,
  updateFlowComment,
  deleteFlowComment,
  flowCommentOptimisticMutationFn,
};
