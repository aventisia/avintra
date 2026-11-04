import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { FetchParentFlowDto } from "../dtos/fetch-parent-flow.dto";
import { FetchSubFlowDto } from "../dtos/fetch-sub-flow.dto";
import { FlowSilentUpdateDto } from "../dtos/flow-silent-update.dto";
import { LoadFlowDto } from "../dtos/load-flow.dto";
import { PublishFlowVersionDto } from "../dtos/publish-flow-version.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow`;

/**
 * Retrieves the flow record to load when the user opens it in the studio.
 */
const getFlowToLoad = (flowId: string, versionId?: string) => {
  const url = versionId
    ? `${baseAPIURL}/load/${flowId}?versionId=${versionId}`
    : `${baseAPIURL}/load/${flowId}`;

  return axiosInstance
    .get<IHttpResponse<LoadFlowDto>>(url, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Updates the flow's nodes, edges, etc. and saves the flow version in the database.
 */
const saveFlow = (flowSilentUpdateDto: FlowSilentUpdateDto) => {
  return axiosInstance
    .put<IHttpResponse<boolean>>(`${baseAPIURL}/save`, flowSilentUpdateDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Publishes a flow version.
 */
const publishFlowVersion = (publishFlowVersionDto: PublishFlowVersionDto) => {
  return axiosInstance
    .put<IHttpResponse<boolean>>(`${baseAPIURL}/publish`, publishFlowVersionDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Fetch the parent flow details of given parent flow version id.
 */
const fetchParentFlow = (parentFlowVersionId: string) => {
  return axiosInstance
    .post<IHttpResponse<FetchParentFlowDto>>(
      `${baseAPIURL}/fetch-parent-flow/${parentFlowVersionId}`,
      null,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Fetch the reactFlowObject of given list of flow version ids.
 */
const fetchSubFlows = (subFlowIds: string[]) => {
  return axiosInstance
    .post<IHttpResponse<FetchSubFlowDto[]>>(`${baseAPIURL}/fetch-sub-flows`, subFlowIds, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

export { getFlowToLoad, saveFlow, publishFlowVersion, fetchParentFlow, fetchSubFlows };
