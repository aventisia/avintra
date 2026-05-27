import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { SearchAgentsDto } from "../dtos/search-agent-dto";

// Base API URL from environment variables
const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/agent/search`;

/**
 * Fetch a list of agents matching the search term.
 *
 * @param value - Optional search keyword to filter agents.
 * @returns A promise that resolves to a list of matching agents wrapped in an HTTP response object.
 */
const getSearchAgent = (value?: string) => {
  return axiosInstance
    .get<IHttpResponse<SearchAgentsDto[]>>(`${baseAPIURL}/${value}`)
    .then((res) => res.data); // Return only the response data
};

// Export the function for use in hooks or components
export { getSearchAgent };
