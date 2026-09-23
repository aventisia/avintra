import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import {
  ToolDto,
  UsableToolCatalogItemDto,
  UsableToolDto,
  UsableToolOperationsDto,
} from "../dtos/tool-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/tools`;

/**
 * Gets the platform, personal, shared and tenant-wide tools the current user can use
 * in the current environment and space.
 */
const getUsableTools = () =>
  axiosInstance
    .get<IHttpResponse<UsableToolDto[]>>(`${baseAPIURL}/usable`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);

/**
 * Gets the personal tools owned by the current user within the current environment.
 * Used by the flow-builder Custom Tools directory.
 */
const getPersonalTools = () =>
  axiosInstance
    .get<IHttpResponse<ToolDto[]>>(`${baseAPIURL}/list`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);

/**
 * Gets the usable tools together with their enriched operations in a single
 * payload. Used by the flow-builder Custom Tools directory (one round-trip for
 * both the L2 tool list and the L3 per-tool actions).
 */
const getUsableToolCatalog = () =>
  axiosInstance
    .get<IHttpResponse<UsableToolCatalogItemDto[]>>(`${baseAPIURL}/usable/catalog`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);

/**
 * Gets the operations exposed by a usable tool, together with the credential type
 * required to invoke it.
 */
const getUsableToolOperations = (toolId: string) =>
  axiosInstance
    .get<IHttpResponse<UsableToolOperationsDto>>(`${baseAPIURL}/usable/${toolId}/operations`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);

export { getUsableTools, getUsableToolOperations, getUsableToolCatalog, getPersonalTools };
