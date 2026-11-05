import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { ConversationDto } from "../dtos/conversation.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/conversations`;

/**
 * Retrieves active agent-less landing conversations for the current user.
 */
export const getLandingActiveConversations = () => {
  return axiosInstance
    .get<IHttpResponse<ConversationDto[]>>(`${baseAPIURL}/landing/active`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves archived agent-less landing conversations for the current user.
 */
export const getLandingArchivedConversations = () => {
  return axiosInstance
    .get<IHttpResponse<ConversationDto[]>>(`${baseAPIURL}/landing/archived`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
