import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { FlowUserDto } from "../dtos/flow-user-dto";
import { WorkspaceUserDto } from "../dtos/workspace-user-dto";

const flowUserApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-user`;
const workspaceUserApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/user`;

/**
 * Retrieves all flows users of a flow.
 */
const getSearchUser = (value?: string) => {
  return axiosInstance
    .get<
      IHttpResponse<WorkspaceUserDto[]>
    >(`${workspaceUserApiUrl}/search/${value}`)
    .then((res) => res.data);
};

/**
 * Retrieves all flows users of a flow.
 */
const getFlowUser = (FlowId?: string) => {
  return axiosInstance
    .get<IHttpResponse<FlowUserDto[]>>(`${flowUserApiUrl}/list/${FlowId}`)
    .then((res) => res.data);
};

/**
 * Inserts a new flow users.
 */
const insertFlowUser = (newFlowUser: FlowUserDto) => {
  return axiosInstance
    .post<IHttpResponse<FlowUserDto>>(`${flowUserApiUrl}`, newFlowUser)
    .then((res) => res.data);
};

/**
 * Update existing flow users.
 */
const updateFlowUser = (newFlowUser: FlowUserDto) => {
  return axiosInstance
    .put<IHttpResponse<FlowUserDto>>(`${flowUserApiUrl}`, newFlowUser)
    .then((res) => res.data);
};

/**
 * Delete flow user.
 */
const deleteFlowUser = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${flowUserApiUrl}/${id}`)
    .then((res) => res.data);
};

export {
  getSearchUser,
  getFlowUser,
  insertFlowUser,
  deleteFlowUser,
  updateFlowUser,
};
