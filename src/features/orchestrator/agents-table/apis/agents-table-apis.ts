import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { AgentsTableDto } from "../dtos/agents-table-dto";

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
