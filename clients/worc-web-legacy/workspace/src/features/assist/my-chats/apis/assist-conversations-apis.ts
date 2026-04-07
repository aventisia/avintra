import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { ConversationSummaryDto } from "../dtos/conversation-summary-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/assist/conversations`;

/**
 * Inserts a new conversation.
 */
export const insertConversation = (flowVersionId: string) => {
  return axiosInstance
    .post<
      IHttpResponse<ConversationSummaryDto>
    >(`${baseAPIURL}`, { flowVersionId })
    .then((res) => res.data);
};

/**
 * Archive a conversation by id.
 */
export const archiveConversation = (conversationId: string) => {
  return axiosInstance
    .post<
      IHttpResponse<ConversationSummaryDto>
    >(`${baseAPIURL}/${conversationId}/archive`)
    .then((res) => res.data);
};

/**
 * Unarchive a conversation by id.
 */
export const unarchiveConversation = (conversationId: string) => {
  return axiosInstance
    .post<
      IHttpResponse<ConversationSummaryDto>
    >(`${baseAPIURL}/${conversationId}/unarchive`)
    .then((res) => res.data);
};
