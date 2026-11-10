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
