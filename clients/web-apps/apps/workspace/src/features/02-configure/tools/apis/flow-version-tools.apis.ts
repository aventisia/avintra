import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { FlowVersionToolDto } from "../dtos/index";

export const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-version-tools`;

/**
 * Retrieves links between a flow version and its tools.
 */
export const getFlowVersionTools = (flowVersionId: string) => {
  return axiosInstance
    .get<IHttpResponse<FlowVersionToolDto[]>>(`${baseAPIURL}?flowVersionId=${flowVersionId}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Links a tool to a flow version.
 */
export const linkToolToFlowVersion = (dto: FlowVersionToolDto) => {
  return axiosInstance
    .post<IHttpResponse<FlowVersionToolDto>>(`${baseAPIURL}`, dto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing flow version tool link.
 */
export const updateFlowVersionTool = (dto: FlowVersionToolDto) => {
  return axiosInstance
    .put<IHttpResponse<FlowVersionToolDto>>(`${baseAPIURL}`, dto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Removes a flow version tool link.
 */
export const deleteFlowVersionTool = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};
