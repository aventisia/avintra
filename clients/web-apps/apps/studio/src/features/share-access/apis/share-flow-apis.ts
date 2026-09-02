import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { FlowUserDto } from "../dtos/flow-user-dto";
import { WorkspaceUserDto } from "../dtos/workspace-user-dto";

const flowUserApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-user`;
const workspaceUserApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/user`;

/**
 * Retrieves all flows users of a flow.
 */
const getSearchUser = (value?: string) => {
  return axiosInstance
    .get<IHttpResponse<WorkspaceUserDto[]>>(`${workspaceUserApiUrl}/search/${value}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves all flows users of a flow.
 */
const getFlowUser = (FlowId?: string) => {
  return axiosInstance
    .get<IHttpResponse<FlowUserDto[]>>(`${flowUserApiUrl}/list/${FlowId}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new flow users.
 */
const insertFlowUser = (newFlowUser: FlowUserDto) => {
  return axiosInstance
    .post<IHttpResponse<FlowUserDto>>(`${flowUserApiUrl}`, newFlowUser, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Update existing flow users.
 */
const updateFlowUser = (newFlowUser: FlowUserDto) => {
  return axiosInstance
    .put<IHttpResponse<FlowUserDto>>(`${flowUserApiUrl}`, newFlowUser, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Delete flow user.
 */
const deleteFlowUser = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${flowUserApiUrl}/${id}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

export { getSearchUser, getFlowUser, insertFlowUser, deleteFlowUser, updateFlowUser };
