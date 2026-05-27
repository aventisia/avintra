import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { SearchBlocksDto } from "../dtos/search-block-dto";

// Base API URL from environment variables
const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}`;

/**
 * Fetch a list of blocks matching the search term.
 *
 * @param query - Search keyword to filter blocks.
 * @returns A promise that resolves to a list of matching blocks wrapped in an HTTP response object.
 */
const getSearchBlock = (query: string) => {
  return axiosInstance
    .get<
      IHttpResponse<SearchBlocksDto[]>
    >(`${baseAPIURL}/block/search/${query}`)
    .then((res) => res.data); // Return only the response data
};

// Export the function for use in hooks or components
export { getSearchBlock };
