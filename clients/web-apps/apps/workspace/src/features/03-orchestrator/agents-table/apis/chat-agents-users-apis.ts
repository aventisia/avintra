import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { ChatAgentUserDto } from "../dtos/chat-agent-users-dto";

const agentUserApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flowversion-user`;

/**
 * Retrieves all ChatAgent users.
 */
const getChatAgentUsers = (flowVersionId?: string) => {
  return axiosInstance
    .get<IHttpResponse<ChatAgentUserDto[]>>(`${agentUserApiUrl}/${flowVersionId}/list`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new ChatAgent users.
 */
const insertChatAgentUser = (newChatAgentUser: ChatAgentUserDto) => {
  return axiosInstance
    .post<IHttpResponse<ChatAgentUserDto>>(`${agentUserApiUrl}`, newChatAgentUser, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
/**
 * Updates an existing ChatAgent user.
 */
const updateChatAgentUser = (updatedUser: ChatAgentUserDto) => {
  return axiosInstance
    .put<IHttpResponse<ChatAgentUserDto>>(`${agentUserApiUrl}`, updatedUser, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Delete ChatAgent user.
 */
const deleteChatAgentUser = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${agentUserApiUrl}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

export { getChatAgentUsers, insertChatAgentUser, updateChatAgentUser, deleteChatAgentUser };
