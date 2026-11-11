import { type IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getSpaceHeaders } from "@/utils/space-headers";

import { type ConversationDto } from "../dtos/conversation.dto";
import { type LandingConversationDto } from "../dtos/landing-conversation.dto";
import { type UpdateConversationPinDto } from "../dtos/update-conversation-pin.dto";
import { type UpdateConversationTitleDto } from "../dtos/update-conversation-title.dto";

const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/conversations`;

/** Lists a page of the user's titled Home conversations, most recent first. */
export const getLandingConversations = (params: { search?: string; skip: number; take: number }) =>
  axiosInstance
    .get<IHttpResponse<LandingConversationDto[]>>(`${baseAPIURL}/landing/list`, {
      params,
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);

/** Creates a new agent-less landing conversation. */
export const createConversation = () =>
  axiosInstance
    .post<IHttpResponse<ConversationDto>>(baseAPIURL, {}, { headers: getSpaceHeaders() })
    .then((res) => res.data);

/** Renames one of the user's Home conversations. */
export const updateLandingConversationTitle = (
  updateConversationTitleDto: UpdateConversationTitleDto,
) =>
  axiosInstance
    .put<IHttpResponse<boolean>>(`${baseAPIURL}/landing/title`, updateConversationTitleDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);

/** Pins or unpins one of the user's Home conversations. */
export const updateLandingConversationPin = (updateConversationPinDto: UpdateConversationPinDto) =>
  axiosInstance
    .put<IHttpResponse<boolean>>(`${baseAPIURL}/landing/pin`, updateConversationPinDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);

/** Deletes one of the user's conversations with its messages. */
export const deleteConversation = (conversationId: string) =>
  axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${conversationId}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
