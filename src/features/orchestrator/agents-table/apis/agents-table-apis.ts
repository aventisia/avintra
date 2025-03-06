import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { AgentsTableDto } from "../dtos/agents-table-dto";
import { AssignMachineDto } from "../dtos/assign-machine-dto";
import { AgentAssignMachineDto } from "../dtos/agent-assign-machine-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/agent`;

/**
 * Retrieves all published agents.
 */
export const getPublishedAgents = () => {
  // Fetch agents from API
  return axiosInstance
    .get<IHttpResponse<AgentsTableDto[]>>(`${baseAPIURL}/publish-flows/`)
    .then((res) => res.data);
};


/**
 * Retrieves list of select options to assign a machine to agent.
 */
export const getAssignableMachines = (agentId: string) => {
  return axiosInstance
    .get<IHttpResponse<AssignMachineDto[]>>(`${baseAPIURL}/${agentId}/machines`)
    .then((res) => res.data);
};

/**
 * assign machines to the agent
 */
export const assignMachines = (assignMachineDto: AgentAssignMachineDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/${assignMachineDto.flowVersionId}/assign-machines`, assignMachineDto.machineIds)
    .then((res) => res.data);
};