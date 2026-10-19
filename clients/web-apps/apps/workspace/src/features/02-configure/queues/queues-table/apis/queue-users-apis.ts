import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { QueueUserDto } from "../dtos/queue-users-dto";

const queueUserApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/queue-user`;

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

export { getQueueUsers, insertQueueUser, updateQueueUser, deleteQueueUser };
