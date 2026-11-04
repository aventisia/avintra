import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import {
  CreateResourceUserAccessDto,
  ResourceUserAccessDto,
  UpdateTenantWideAccessDto,
} from "../dtos/resource-user-access.dto";
import { ResourceTypeEnum } from "../enums/resource-type-enum";

const resourceUserAccessApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/resource-user-access`;

/**
 * Retrieves all ResourceUserAccess list.
 */
const getAllResourceUserAccess = () => {
  return axiosInstance
    .get<IHttpResponse<ResourceUserAccessDto[]>>(`${resourceUserAccessApiUrl}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves ResourceUserAccess list by resource id.
 */
const getResourceUserAccessById = (resourceId: string, resourceType?: ResourceTypeEnum) => {
  return axiosInstance
    .get<IHttpResponse<ResourceUserAccessDto[]>>(`${resourceUserAccessApiUrl}/${resourceId}/list`, {
      params: { resourceType },
    })
    .then((res) => res.data);
};

/**
 * Inserts a new ResourceUserAccess.
 */
const insertResourceUserAccess = (payload: CreateResourceUserAccessDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${resourceUserAccessApiUrl}/bulk`, payload)
    .then((res) => res.data);
};

/**
 * Updates an existing ResourceUserAccess.
 */
const updateResourceUserAccess = (payload: ResourceUserAccessDto) => {
  return axiosInstance
    .put<IHttpResponse<ResourceUserAccessDto>>(`${resourceUserAccessApiUrl}`, payload)
    .then((res) => res.data);
};

/**
 * Updates Tenant access of an existing ResourceUserAccess.
 */
const updateTenantWideAccess = (payload: UpdateTenantWideAccessDto) => {
  return axiosInstance
    .put<IHttpResponse<ResourceUserAccessDto>>(`${resourceUserAccessApiUrl}/tenant-access`, payload)
    .then((res) => res.data);
};

/**
 * Remove ResourceUserAccess.
 */
const removeResourceUserAccess = (resourceId: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${resourceUserAccessApiUrl}/${resourceId}/my-access`)
    .then((res) => res.data);
};

/**
 * Delete ResourceUserAccess.
 */
const deleteResourceUserAccess = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${resourceUserAccessApiUrl}/${id}`)
    .then((res) => res.data);
};

export {
  getAllResourceUserAccess,
  getResourceUserAccessById,
  insertResourceUserAccess,
  updateResourceUserAccess,
  updateTenantWideAccess,
  deleteResourceUserAccess,
  removeResourceUserAccess,
};
