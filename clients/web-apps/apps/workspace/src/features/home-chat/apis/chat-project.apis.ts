import { type IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getSpaceHeaders } from "@/utils/space-headers";

import { type ChatProjectDto } from "../dtos/chat-project.dto";

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
