import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { ConversationMessageDto } from "../dtos/conversation-message-dto";
import { ConversationSummaryDto } from "../dtos/conversation-summary-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/conversations`;

/**
 * Inserts a new conversation.
 */
export const insertConversation = (flowVersionId: string) => {
  return axiosInstance
    .post<IHttpResponse<ConversationSummaryDto>>(
      `${baseAPIURL}`,
      { flowVersionId },
      {
        headers: getSpaceHeaders(),
      },
    )
    .then((res) => res.data);
};

/**
 * Archive a conversation by id.
 */
export const archiveConversation = (conversationId: string) => {
  return axiosInstance
    .post<IHttpResponse<ConversationSummaryDto>>(`${baseAPIURL}/${conversationId}/archive`, null, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Unarchive a conversation by id.
 */
export const unarchiveConversation = (conversationId: string) => {
  return axiosInstance
    .post<IHttpResponse<ConversationSummaryDto>>(
      `${baseAPIURL}/${conversationId}/unarchive`,
      null,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Inserts a new Message.
 */
export const insertConversationMessage = (payload: ConversationMessageDto) => {
  return axiosInstance
    .post<IHttpResponse<ConversationMessageDto>>(`${baseAPIURL}/messages`, payload, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Get list of messages of conversationId.
 */
export const getConversationMessages = (conversationId: string) => {
  return axiosInstance
    .get<IHttpResponse<ConversationMessageDto[]>>(`${baseAPIURL}/messages/${conversationId}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
