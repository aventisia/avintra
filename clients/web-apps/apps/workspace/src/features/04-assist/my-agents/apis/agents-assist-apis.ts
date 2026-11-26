import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { AgentsAssistDto } from "../dtos/agent-assist-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/agent`;

/**
 * Retrieves the agents (published flow versions) assigned to the machines
 * linked with the currently logged-in user.
 */
export const getMyAgents = () => {
  return axiosInstance
    .get<IHttpResponse<AgentsAssistDto[]>>(`${baseAPIURL}/my-agents`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
