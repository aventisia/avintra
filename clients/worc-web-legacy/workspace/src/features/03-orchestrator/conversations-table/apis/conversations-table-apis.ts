import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { AdminConversationDto } from "../dtos/conversations-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/admin/conversations`;

/**
 * Retrieves list of Conversations.
 */
export const getConversations = (
  startDate: string = "",
  endDate: string = "",
) => {
  return axiosInstance
    .get<
      IHttpResponse<AdminConversationDto[]>
    >(`${baseAPIURL}?startDate=${startDate}&endDate=${endDate}`)
    .then((res) => res.data);
};

/**
 * Retrieves Conversations data.
 */
export const getConversationsById = (id?: string) => {
  return axiosInstance
    .get<IHttpResponse<AdminConversationDto>>(`${baseAPIURL}/${id}/messages`)
    .then((res) => res.data);
};
