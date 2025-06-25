import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { PublishedAgentDto } from "../dtos/published-agent-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/agent`;

/**
 * Retrieves all flows created by user
 */
const getAgents = () => {
  return axiosInstance
    .get<IHttpResponse<PublishedAgentDto[]>>(`${baseAPIURL}/publish-flows`)
    .then((res) => res.data);
};

export { getAgents };
