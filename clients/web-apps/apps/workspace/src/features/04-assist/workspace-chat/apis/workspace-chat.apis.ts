import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { ConversationDto } from "../dtos/conversation.dto";
import { ChatArtifactDto } from "../dtos/chat-artifact.dto";
import { InsertChatArtifactDto } from "../dtos/insert-chat-artifact.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/conversations`;
const artifactAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/chat-artifacts`;

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

/**
 * Retrieves list of chat artifacts.
 */
export const getChatArtifacts = (conversationId: string) => {
  return axiosInstance
    .get<IHttpResponse<ChatArtifactDto[]>>(`${artifactAPIURL}/list/${conversationId}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves list of all chat artifacts.
 */
export const getAllChatArtifacts = () => {
  return axiosInstance
    .get<IHttpResponse<ChatArtifactDto[]>>(`${artifactAPIURL}/list-all`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves a chat artifact by its ID.
 */
export const getChatArtifact = (chatArtifactId: string) => {
  return axiosInstance
    .get<IHttpResponse<ChatArtifactDto>>(`${artifactAPIURL}/${chatArtifactId}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new chat artifact.
 */
export const createChatArtifact = (insertChatArtifactDto: InsertChatArtifactDto) => {
  return axiosInstance
    .post<IHttpResponse<ChatArtifactDto>>(artifactAPIURL, insertChatArtifactDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes an existing chat artifact.
 */
export const deleteChatArtifact = (chatArtifactId: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${artifactAPIURL}/${chatArtifactId}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes multiple chat artifacts by their IDs.
 */
export const deleteMultipleChatArtifacts = (chatArtifactIds: string[]) => {
  return axiosInstance
    .post<IHttpResponse<number>>(`${artifactAPIURL}/delete-multiple`, chatArtifactIds, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
