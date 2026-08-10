import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { AdminConversationDto } from "../dtos/conversations-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/admin/conversations`;

/**
 * Retrieves list of Conversations.
 */
export const getConversations = (startDate: string = "", endDate: string = "") => {
  return axiosInstance
    .get<IHttpResponse<AdminConversationDto[]>>(
      `${baseAPIURL}?startDate=${startDate}&endDate=${endDate}`,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Retrieves Conversations data.
 */
export const getConversationsById = (id?: string) => {
  return axiosInstance
    .get<IHttpResponse<AdminConversationDto>>(`${baseAPIURL}/${id}/messages`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
