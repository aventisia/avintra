import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { ChatAgentPromptRequestDto } from "../dtos/chat-agent-prompt-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/project-template`;

/**
 * Generates a sample ChatAgent system prompt when the payload is empty, or refines
 * the provided prompt otherwise.
 */
const generateChatAgentPrompt = (request: ChatAgentPromptRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<string>>(`${baseAPIURL}/generate`, request, {
      headers: getStudioSpaceHeaders(),
      timeout: 5 * 60000,
    })
    .then((res) => res.data);
};

export { generateChatAgentPrompt };
