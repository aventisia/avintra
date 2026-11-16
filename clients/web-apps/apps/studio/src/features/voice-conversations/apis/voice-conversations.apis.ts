import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import type { ConversationDto, ConversationMessageDto } from "../dtos/conversation.dto";

const conversationsAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/conversations`;

/**
 * Retrieves active conversations for a specific flow version.
 */
export const getActiveConversations = (flowVersionId: string) =>
  axiosInstance
    .get<IHttpResponse<ConversationDto[]>>(`${conversationsAPIURL}/${flowVersionId}/active`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);

/**
 * Gets all messages for a conversation (full history).
 */
export const getMessages = (conversationId: string) =>
  axiosInstance
    .get<IHttpResponse<ConversationMessageDto[]>>(
      `${conversationsAPIURL}/messages/${conversationId}`,
      { headers: getStudioSpaceHeaders() },
    )
    .then((res) => res.data);
