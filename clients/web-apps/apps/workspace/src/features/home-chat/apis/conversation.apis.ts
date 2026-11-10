import { type IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getSpaceHeaders } from "@/utils/space-headers";

import { type ConversationDto } from "../dtos/conversation.dto";

const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/conversations`;

/** Creates a new agent-less landing conversation. */
export const createConversation = () =>
  axiosInstance
    .post<IHttpResponse<ConversationDto>>(baseAPIURL, {}, { headers: getSpaceHeaders() })
    .then((res) => res.data);
