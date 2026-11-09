import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { AdminConversationDto } from "../dtos/conversations-table-dto";
import { ConversationChannelEnum } from "../enums/conversation-channel.enum";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/admin/conversations`;

/**
 * Retrieves list of Conversations.
 */
export const getConversations = (
  startDate: string = "",
  endDate: string = "",
  channel?: ConversationChannelEnum,
) => {
  const params = new URLSearchParams({ startDate, endDate });
  if (channel) params.set("channel", channel);

  return axiosInstance
    .get<IHttpResponse<AdminConversationDto[]>>(`${baseAPIURL}?${params.toString()}`, {
      headers: getSpaceHeaders(),
    })
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
