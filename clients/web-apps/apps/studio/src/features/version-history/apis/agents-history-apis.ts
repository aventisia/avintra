import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { FlowVersionHistoryDetailDto } from "../dtos/agent-history-details-dto";
import { FlowVersionHistoryDto } from "../dtos/agent-history-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-version-history`;

/**
 * Retrieves all agents change history
 */
const getAgentsHistory = (flowVersionId: string) => {
  return axiosInstance
    .get<IHttpResponse<FlowVersionHistoryDto[]>>(`${baseAPIURL}/${flowVersionId}/list`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Get agents detail change history by id
 */
const getAgentsHistoryById = (flowVersionHistoryId: string) => {
  return axiosInstance
    .get<IHttpResponse<FlowVersionHistoryDetailDto>>(`${baseAPIURL}/${flowVersionHistoryId}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Clone agent version history to new Version
 */
const cloneHistoryToVersion = (versionHistory: FlowVersionHistoryDetailDto) => {
  return axiosInstance
    .post<IHttpResponse<FlowVersionHistoryDetailDto>>(
      `${baseAPIURL}/clone-flow-version`,
      versionHistory,
      { headers: getStudioSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Clone agent version history to  new agent
 */
const cloneHistoryToAgent = (versionHistory: FlowVersionHistoryDetailDto) => {
  return axiosInstance
    .post<IHttpResponse<FlowVersionHistoryDetailDto>>(`${baseAPIURL}/clone-flow`, versionHistory, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

export { getAgentsHistory, getAgentsHistoryById, cloneHistoryToVersion, cloneHistoryToAgent };
