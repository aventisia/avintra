import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { AssistChatDto } from "../dtos/assist-chat.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist-chat`;

/**
 * Retrieves list of active chat agents.
 */
export const getActiveChatAgents = () => {
  return axiosInstance
    .get<IHttpResponse<AssistChatDto[]>>(`${baseAPIURL}/active`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Retrieves list of archived chat agents.
 */
export const getArchivedChatAgents = () => {
  return axiosInstance
    .get<IHttpResponse<AssistChatDto[]>>(`${baseAPIURL}/archived`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
