import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { PublishedUiDto, PublishedUiUserDto, PublishedUiViewDto } from "../dtos/published-ui-dto";
import { WorkspaceUserDto } from "../dtos/workspace-user-dto";

const uiBuilderApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/ui-builder`;
const projectUserApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/uibuilder-project-user`;
const workspaceUserApiUrl: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-account`;

/**
 * Retrieves all published custom UI builder projects.
 */
export const getPublishedUis = () => {
  return axiosInstance
    .get<IHttpResponse<PublishedUiDto[]>>(`${uiBuilderApiUrl}/published`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves a published UI builder project and its pinned published version for the orchestrator preview.
 */
export const getOmUiView = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<PublishedUiViewDto>>(`${uiBuilderApiUrl}/published/${id}/om-view`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates a UI builder project (used to disable or enable it).
 */
export const updatePublishedUi = (updatedProject: PublishedUiDto) => {
  return axiosInstance
    .put<IHttpResponse<PublishedUiDto>>(`${uiBuilderApiUrl}`, updatedProject, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves tenant users matching the search value.
 */
export const getSearchPublishedUiUser = (value?: string, includeCurrentUser: boolean = true) => {
  return axiosInstance
    .get<IHttpResponse<WorkspaceUserDto[]>>(
      `${workspaceUserApiUrl}/users/search/${value}?includeCurrentUser=${includeCurrentUser}`,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Retrieves all users assigned to a published UI builder project.
 */
export const getPublishedUiUsers = (uiBuilderProjectId: string) => {
  return axiosInstance
    .get<IHttpResponse<PublishedUiUserDto[]>>(`${projectUserApiUrl}/${uiBuilderProjectId}/list`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Assigns a user (or all team members) to a published UI builder project.
 */
export const insertPublishedUiUser = (newUiUser: PublishedUiUserDto) => {
  return axiosInstance
    .post<IHttpResponse<PublishedUiUserDto>>(`${projectUserApiUrl}`, newUiUser, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Removes a user assignment from a published UI builder project.
 */
export const deletePublishedUiUser = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${projectUserApiUrl}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};
