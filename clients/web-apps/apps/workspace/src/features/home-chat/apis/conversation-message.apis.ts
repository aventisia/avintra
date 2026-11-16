import { type IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getSpaceHeaders } from "@/utils/space-headers";

import { type ConversationMessageDto } from "../dtos/conversation-message.dto";

const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/conversations/messages`;

/** Gets all messages for a conversation (full history). */
export const getMessages = (conversationId: string) =>
  axiosInstance
    .get<IHttpResponse<ConversationMessageDto[]>>(`${baseAPIURL}/${conversationId}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);

/** Gets all messages of a shared conversation by its read-only token. */
export const getSharedMessages = (shareToken: string) =>
  axiosInstance
    .get<IHttpResponse<ConversationMessageDto[]>>(`${baseAPIURL}/shared/${shareToken}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);

/** Rates the reply to one user turn (zero-based) of a conversation. */
export const setMessageFeedback = (
  conversationId: string,
  userTurn: number,
  rating: "positive" | "negative",
) =>
  axiosInstance
    .put<IHttpResponse<boolean>>(
      `${baseAPIURL}/${conversationId}/feedback`,
      { userTurn, rating },
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
