import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { UiBuilderTableDto } from "../dtos/ui-builder-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/ui-builder`;

/**
 * Retrieves custom UI builder projects created by the user or shared tenant-wide.
 */
const getUiBuilderProjects = ({ isPersonal = true }: { isPersonal: boolean }) => {
  const path = isPersonal ? `list` : `list/shared`;
  return axiosInstance
    .get<IHttpResponse<UiBuilderTableDto[]>>(`${baseAPIURL}/${path}`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves a custom UI builder project by its ID.
 */
const getUiBuilderProject = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<UiBuilderTableDto>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Inserts a new custom UI builder project.
 */
const createUiBuilderProject = (newProject: UiBuilderTableDto) => {
  return axiosInstance
    .post<IHttpResponse<UiBuilderTableDto>>(`${baseAPIURL}`, newProject, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing custom UI builder project.
 */
const updateUiBuilderProject = (updatedProject: UiBuilderTableDto) => {
  return axiosInstance
    .put<IHttpResponse<UiBuilderTableDto>>(`${baseAPIURL}`, updatedProject, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes a custom UI builder project by its ID.
 */
const deleteUiBuilderProject = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Deletes multiple custom UI builder projects by their IDs.
 */
const deleteMultipleUiBuilderProjects = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<number>>(`${baseAPIURL}/delete-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Checks the availability of a custom UI builder project name.
 */
const isUiBuilderNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a custom UI builder project based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<UiBuilderTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const uiBuilderOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<UiBuilderTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return createUiBuilderProject(payload as UiBuilderTableDto);
    case "update":
      return updateUiBuilderProject(payload as UiBuilderTableDto);
    case "delete":
      return deleteUiBuilderProject(payload as string);
    case "delete-multiple":
      return deleteMultipleUiBuilderProjects(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

/**
 * Retrieves custom UI builder projects offered to the tenant as templates.
 */
const getUiBuilderTemplates = () => {
  return axiosInstance
    .get<IHttpResponse<UiBuilderTableDto[]>>(`${baseAPIURL}/templates`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Creates a new custom UI builder project from a template.
 */
const cloneUiBuilderProject = (templateId: string, newProject: UiBuilderTableDto) => {
  return axiosInstance
    .post<IHttpResponse<UiBuilderTableDto>>(`${baseAPIURL}/${templateId}/clone`, newProject, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

export {
  getUiBuilderProjects,
  getUiBuilderProject,
  createUiBuilderProject,
  updateUiBuilderProject,
  deleteUiBuilderProject,
  deleteMultipleUiBuilderProjects,
  isUiBuilderNameAvailable,
  uiBuilderOptimisticMutationFn,
  getUiBuilderTemplates,
  cloneUiBuilderProject,
};
