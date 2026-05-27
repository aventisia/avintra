import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { AssistChatDto } from "../dtos/assist-chat-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist-chat`;

/**
 * Retrieves list of active chat agents.
 */
export const getActiveChatAgents = () => {
  return axiosInstance
    .get<IHttpResponse<AssistChatDto[]>>(`${baseAPIURL}/active`)
    .then((res) => res.data);
};

/**
 * Retrieves list of archived chat agents.
 */
export const getArchivedChatAgents = () => {
  return axiosInstance
    .get<IHttpResponse<AssistChatDto[]>>(`${baseAPIURL}/archived`)
    .then((res) => res.data);
};
