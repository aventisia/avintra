import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import {
  CreateResourceShareDto,
  ResourceShareDto,
  TenantAccessResourceShareDto,
} from "../dtos/resource-share-dto";
import { WorkspaceUserDto } from "../dtos/workspace-user-dto";

const resourceShareApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/resource-share`;
const workspaceUserApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/user`;

/**
 * Retrieves all Workspace users.
 */
const getSearchUser = (value?: string, includeCurrentUser: boolean = false) => {
  return axiosInstance
    .get<
      IHttpResponse<WorkspaceUserDto[]>
    >(`${workspaceUserApiUrl}/search/${value}?includeCurrentUser=${includeCurrentUser}`)
    .then((res) => res.data);
};

/**
 * Retrieves all ResourceShare list.
 */
const getAllResourceShare = () => {
  return axiosInstance
    .get<IHttpResponse<ResourceShareDto[]>>(`${resourceShareApiUrl}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves ResourceShare list by resource id.
 */
const getResourceShareById = (resourceId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<ResourceShareDto[]>
    >(`${resourceShareApiUrl}/${resourceId}/list`)
    .then((res) => res.data);
};

/**
 * Inserts a new ResourceShare.
 */
const insertResourceShare = (payload: CreateResourceShareDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${resourceShareApiUrl}/bulk`, payload)
    .then((res) => res.data);
};

/**
 * Updates an existing ResourceShare.
 */
const updateResourceShare = (payload: ResourceShareDto) => {
  return axiosInstance
    .put<IHttpResponse<ResourceShareDto>>(`${resourceShareApiUrl}`, payload)
    .then((res) => res.data);
};

/**
 * Updates Tenant access of an existing ResourceShare.
 */
const updateTenantWideAccess = (payload: TenantAccessResourceShareDto) => {
  return axiosInstance
    .put<
      IHttpResponse<ResourceShareDto>
    >(`${resourceShareApiUrl}/tenant-access`, payload)
    .then((res) => res.data);
};

/**
 * Remove ResourceShare.
 */
const removeResourceShare = (resourceId: string) => {
  return axiosInstance
    .delete<
      IHttpResponse<boolean>
    >(`${resourceShareApiUrl}/${resourceId}/my-access`)
    .then((res) => res.data);
};

/**
 * Delete ResourceShare.
 */
const deleteResourceShare = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${resourceShareApiUrl}/${id}`)
    .then((res) => res.data);
};

export {
  getSearchUser,
  getAllResourceShare,
  getResourceShareById,
  insertResourceShare,
  updateResourceShare,
  updateTenantWideAccess,
  deleteResourceShare,
  removeResourceShare,
};
