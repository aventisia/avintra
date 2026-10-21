import { IHttpResponse } from "@avplatform/ui/dtos";

import { WorkspaceUserDto } from "@/features/03-orchestrator/agents-table/dtos/workspace-user-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { UiBuilderUserDto } from "../dtos/ui-builder-users-dto";

const projectUserApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/uibuilder-project-user`;
const workspaceUserApiUrl: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-account`;

/**
 * Retrieves tenant users matching the search value.
 */
export const getSearchUiBuilderUser = (value?: string, includeCurrentUser: boolean = true) => {
  return axiosInstance
    .get<IHttpResponse<WorkspaceUserDto[]>>(
      `${workspaceUserApiUrl}/users/search/${value}?includeCurrentUser=${includeCurrentUser}`,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Retrieves all users assigned to a UI builder project.
 */
export const getUiBuilderProjectUsers = (uiBuilderProjectId: string) => {
  return axiosInstance
    .get<IHttpResponse<UiBuilderUserDto[]>>(`${projectUserApiUrl}/${uiBuilderProjectId}/list`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Assigns a user to a UI builder project.
 */
export const insertUiBuilderProjectUser = (newUiBuilderUser: UiBuilderUserDto) => {
  return axiosInstance
    .post<IHttpResponse<UiBuilderUserDto>>(`${projectUserApiUrl}`, newUiBuilderUser, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing UI builder project user assignment.
 */
export const updateUiBuilderProjectUser = (updatedUiBuilderUser: UiBuilderUserDto) => {
  return axiosInstance
    .put<IHttpResponse<UiBuilderUserDto>>(`${projectUserApiUrl}`, updatedUiBuilderUser, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Removes a user assignment from a UI builder project.
 */
export const deleteUiBuilderProjectUser = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${projectUserApiUrl}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};
