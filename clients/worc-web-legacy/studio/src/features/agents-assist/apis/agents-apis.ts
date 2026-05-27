import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { PublishedAgentDto } from "../dtos/published-agent-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/agent`;

/**
 * Retrieves all flows created by user
 */
const getAgents = () => {
  return axiosInstance
    .get<IHttpResponse<PublishedAgentDto[]>>(`${baseAPIURL}/published`)
    .then((res) => res.data);
};

export { getAgents };
