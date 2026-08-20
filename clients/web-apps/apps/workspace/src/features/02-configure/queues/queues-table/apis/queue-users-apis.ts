import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { QueueUserDto } from "../dtos/queue-users-dto";
import { WorkspaceUserDto } from "../dtos/workspace-user-dto";

const queueUserApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/queue-user`;
const workspaceUserApiUrl: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-account`;

/**
 * Retrieves all Workspace users.
 */

const getSearchUser = (value?: string, includeCurrentUser: boolean = true) => {
  return axiosInstance
    .get<IHttpResponse<WorkspaceUserDto[]>>(
      `${workspaceUserApiUrl}/users/search/${value}?includeCurrentUser=${includeCurrentUser}`,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Retrieves all Queue users.
 */
const getQueueUsers = (queueId?: string) => {
  return axiosInstance
    .get<IHttpResponse<QueueUserDto[]>>(`${queueUserApiUrl}/${queueId}/list`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new queue users.
 */
const insertQueueUser = (newQueueUser: QueueUserDto) => {
  return axiosInstance
    .post<IHttpResponse<QueueUserDto>>(`${queueUserApiUrl}`, newQueueUser, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
/**
 * Updates an existing queue user.
 */
const updateQueueUser = (updatedUser: QueueUserDto) => {
  return axiosInstance
    .put<IHttpResponse<QueueUserDto>>(`${queueUserApiUrl}`, updatedUser, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Delete queue user.
 */
const deleteQueueUser = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${queueUserApiUrl}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

export { getSearchUser, getQueueUsers, insertQueueUser, updateQueueUser, deleteQueueUser };
