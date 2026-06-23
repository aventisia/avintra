import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { ChatAgentUserDto } from "../dtos/chat-agent-users-dto";
import { WorkspaceUserDto } from "../dtos/workspace-user-dto";

const agentUserApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flowversion-user`;
const workspaceUserApiUrl: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-account`;

/**
 * Retrieves all Workspace users.
 */
const getSearchUser = (value?: string, includeCurrentUser: boolean = true) => {
  return axiosInstance
    .get<
      IHttpResponse<WorkspaceUserDto[]>
    >(`${workspaceUserApiUrl}/search/${value}?includeCurrentUser=${includeCurrentUser}`)
    .then((res) => res.data);
};

/**
 * Retrieves all ChatAgent users.
 */
const getChatAgentUsers = (flowVersionId?: string) => {
  return axiosInstance
    .get<
      IHttpResponse<ChatAgentUserDto[]>
    >(`${agentUserApiUrl}/${flowVersionId}/list`)
    .then((res) => res.data);
};

/**
 * Inserts a new ChatAgent users.
 */
const insertChatAgentUser = (newChatAgentUser: ChatAgentUserDto) => {
  return axiosInstance
    .post<
      IHttpResponse<ChatAgentUserDto>
    >(`${agentUserApiUrl}`, newChatAgentUser)
    .then((res) => res.data);
};
/**
 * Updates an existing ChatAgent user.
 */
const updateChatAgentUser = (updatedUser: ChatAgentUserDto) => {
  return axiosInstance
    .put<IHttpResponse<ChatAgentUserDto>>(`${agentUserApiUrl}`, updatedUser)
    .then((res) => res.data);
};

/**
 * Delete ChatAgent user.
 */
const deleteChatAgentUser = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${agentUserApiUrl}/${id}`)
    .then((res) => res.data);
};

export {
  getSearchUser,
  getChatAgentUsers,
  insertChatAgentUser,
  updateChatAgentUser,
  deleteChatAgentUser,
};
