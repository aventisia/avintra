import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { AgentsAssistDto } from "../dtos/agent-assist-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_URL}/machine`;

/**
 * Retrieves list of agents of machine.
 */
export const getMachineAgents = (machineId: string) => {
  return axiosInstance
    .get<IHttpResponse<AgentsAssistDto[]>>(`${baseAPIURL}/${machineId}/agents`)
    .then((res) => res.data);
};
