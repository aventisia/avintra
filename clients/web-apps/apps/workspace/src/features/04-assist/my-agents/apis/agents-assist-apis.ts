import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { AgentsAssistDto } from "../dtos/agent-assist-dto";
import { RemoveAgentsDto } from "../dtos/remove-agents-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/machine`;

/**
 * Retrieves list of agents of machine.
 */
export const getMachineAgents = (machineId: string) => {
  return axiosInstance
    .get<IHttpResponse<AgentsAssistDto[]>>(`${baseAPIURL}/${machineId}/agents`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Remove agents to the machine.
 */
export const removeAgents = (assignAgentDto: RemoveAgentsDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(
      `${baseAPIURL}/${assignAgentDto.machineId}/remove-agents`,
      assignAgentDto.agentIds,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};
