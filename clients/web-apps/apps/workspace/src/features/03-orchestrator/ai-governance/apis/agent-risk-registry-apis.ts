import type { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { AgentRiskAssessmentDto } from "../dtos/agent-risk-assessment-dto";
import { AgentRiskRegistryRowDto } from "../dtos/agent-risk-registry-row-dto";
import { AgentRiskRegistryUpsertDto } from "../dtos/agent-risk-registry-upsert-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/agent-risk-registry`;

/**
 * Retrieves all agent risk registry rows for the table view.
 */
export const getAgentRiskRegistryRows = (): Promise<IHttpResponse<AgentRiskRegistryRowDto[]>> => {
  return axiosInstance
    .get<IHttpResponse<AgentRiskRegistryRowDto[]>>(`${baseAPIURL}/rows`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves the registry rows pending the current user's approval.
 */
export const getPendingApprovals = (): Promise<IHttpResponse<AgentRiskRegistryRowDto[]>> => {
  return axiosInstance
    .get<IHttpResponse<AgentRiskRegistryRowDto[]>>(`${baseAPIURL}/pending-approvals`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves the full registry record for a flow version (agent).
 */
export const getAgentRiskRegistryByFlowVersion = (
  flowVersionId: string,
): Promise<IHttpResponse<AgentRiskAssessmentDto>> => {
  return axiosInstance
    .get<IHttpResponse<AgentRiskAssessmentDto>>(`${baseAPIURL}/flow-version/${flowVersionId}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Upserts the registry record for a flow version. The backend resolves and
 * persists the AI-model and third-party-tool lists from the flow config.
 */
export const upsertAgentRiskRegistry = (
  dto: AgentRiskRegistryUpsertDto,
): Promise<IHttpResponse<AgentRiskAssessmentDto>> => {
  return axiosInstance
    .put<IHttpResponse<AgentRiskAssessmentDto>>(baseAPIURL, dto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
