import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { SearchFlowVersionResDto } from "../dtos/search-flow-version-res-dto";

// Base API URL from environment variables
const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}`;

/**
 * Fetch a list of flow versions based on search criteria, including an optional search keyword, flow type, and a flag to include only published versions.
 *
 * @param query - Optional search keyword to filter flow versions.
 * @param type - Optional flow type to filter results (default: Agent).
 * @param includePublishedOnly - Whether to include only published flow versions (default: true).
 * @returns A promise that resolves to a list of matching flow versions wrapped in an HTTP response object.
 */
const searchFlowVersions = (
  query: string = "",
  type: string = "Agent",
  includePublishedOnly: boolean = true,
) => {
  return axiosInstance
    .get<IHttpResponse<SearchFlowVersionResDto[]>>(
      `${baseAPIURL}/flow-version/search?query=${query}&type=${type}&includePublishedOnly=${includePublishedOnly}`,
      { headers: getStudioSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Fetch agent flow versions for the flow selector, including unpublished versions.
 *
 * @param query - Optional search keyword to filter flow versions.
 * @returns A promise that resolves to the matching agent flow versions.
 */
const searchAgentFlowVersions = (query: string = "") =>
  searchFlowVersions(query, "Agent", true).then((response) => response.data ?? []);

/**
 * Fetch a flow version by its id.
 *
 * @param flowVersionId - Id of the flow version to retrieve.
 * @returns A promise that resolves to the matching flow version wrapped in an HTTP response object.
 */
const getFlowVersion = (flowVersionId: string) => {
  return axiosInstance
    .get<IHttpResponse<SearchFlowVersionResDto>>(`${baseAPIURL}/flow-version/${flowVersionId}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

export { getFlowVersion, searchAgentFlowVersions, searchFlowVersions };
