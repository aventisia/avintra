import { type IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getSpaceHeaders } from "@/utils/space-headers";

import {
  type ChatProjectDto,
  type ChatProjectFileDto,
  type InsertChatProjectFileDto,
} from "../dtos/chat-project.dto";

const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/chat-projects`;

/** Lists the user's Home chat projects by name. */
export const getChatProjects = () =>
  axiosInstance
    .get<IHttpResponse<ChatProjectDto[]>>(baseAPIURL, { headers: getSpaceHeaders() })
    .then((res) => res.data);

/** Creates a Home chat project. */
export const createChatProject = (name: string) =>
  axiosInstance
    .post<IHttpResponse<ChatProjectDto>>(baseAPIURL, { name }, { headers: getSpaceHeaders() })
    .then((res) => res.data);

/** Renames a Home chat project; instructions are left alone unless given ("" clears them). */
export const updateChatProject = (id: string, name: string, instructions?: string) =>
  axiosInstance
    .put<IHttpResponse<ChatProjectDto>>(
      baseAPIURL,
      { id, name, instructions },
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);

/** Lists the text files attached to a project. */
export const getChatProjectFiles = (id: string) =>
  axiosInstance
    .get<IHttpResponse<ChatProjectFileDto[]>>(`${baseAPIURL}/${id}/files`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);

/** Attaches a text file to a project. */
export const createChatProjectFile = (
  chatProjectId: string,
  insertChatProjectFileDto: InsertChatProjectFileDto,
) =>
  axiosInstance
    .post<IHttpResponse<ChatProjectFileDto>>(
      `${baseAPIURL}/${chatProjectId}/files`,
      insertChatProjectFileDto,
      {
        headers: getSpaceHeaders(),
      },
    )
    .then((res) => res.data);

/** Removes a file from a project. */
export const deleteChatProjectFile = (id: string, fileId: string) =>
  axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}/files/${fileId}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);

/** Deletes a Home chat project; its chats stay in the history, ungrouped. */
export const deleteChatProject = (id: string) =>
  axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
