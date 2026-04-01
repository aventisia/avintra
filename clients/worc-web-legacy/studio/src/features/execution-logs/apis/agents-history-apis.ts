import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { FlowVersionHistoryDto } from "../dtos/agent-history-dto";
import { FlowVersionHistoryDetailDto } from "../dtos/agent-history-details-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/flow-version-history`;

/**
 * Retrieves all agents change history
 */
const getAgentsHistory = (flowVersionId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<FlowVersionHistoryDto[]>
    >(`${baseAPIURL}/${flowVersionId}/list`)
    .then((res) => res.data);
};

/**
 * Get agents detail change history by id
 */
const getAgentsHistoryById = (flowVersionHistoryId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<FlowVersionHistoryDetailDto>
    >(`${baseAPIURL}/${flowVersionHistoryId}`)
    .then((res) => res.data);
};

/**
 * Clone agent version history to new Version
 */
const cloneHistoryToVersion = (versionHistory: FlowVersionHistoryDetailDto) => {
  return axiosInstance
    .post<
      IHttpResponse<FlowVersionHistoryDetailDto>
    >(`${baseAPIURL}/clone-flow-version`, versionHistory)
    .then((res) => res.data);
};

/**
 * Clone agent version history to  new agent
 */
const cloneHistoryToAgent = (versionHistory: FlowVersionHistoryDetailDto) => {
  return axiosInstance
    .post<
      IHttpResponse<FlowVersionHistoryDetailDto>
    >(`${baseAPIURL}/clone-flow`, versionHistory)
    .then((res) => res.data);
};

export {
  getAgentsHistory,
  getAgentsHistoryById,
  cloneHistoryToVersion,
  cloneHistoryToAgent,
};
