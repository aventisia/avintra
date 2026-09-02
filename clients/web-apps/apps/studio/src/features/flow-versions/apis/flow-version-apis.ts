import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { FlowVersionDto } from "../dtos/flow-version-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-version`;

/**
 * Retrieves all flows versions of a flow.
 */
const getFlowVersions = (FlowId?: string) => {
  // Return if FlowId is not provided (FlowId can be null if not passed in query params)
  if (!FlowId) return Promise.resolve(null);

  // Fetch flows from API
  return axiosInstance
    .get<IHttpResponse<FlowVersionDto[]>>(`${baseAPIURL}/list/${FlowId}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new flow.
 */
const insertFlowVersion = (newFlowVersion: FlowVersionDto) => {
  return axiosInstance
    .post<IHttpResponse<FlowVersionDto>>(`${baseAPIURL}/create`, newFlowVersion, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Delete flow version.
 */
const deleteFlowVersion = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/delete/${id}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

export { getFlowVersions, insertFlowVersion, deleteFlowVersion };
