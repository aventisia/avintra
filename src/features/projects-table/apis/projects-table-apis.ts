import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { ProjectsTableDto } from "../dtos/projects-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/project`;

/**
 * Retrieves list of projects.
 */
const getProjects = () => {
  return axiosInstance
    .get<IHttpResponse<ProjectsTableDto[]>>(`${baseAPIURL}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a project name.
 */
const isProjectNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new project.
 */
const insertProject = (newProject: ProjectsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<ProjectsTableDto>>(`${baseAPIURL}`, newProject)
    .then((res) => res.data);
};

/**
 * Updates an existing project.
 */
const updateProject = (updatedProject: ProjectsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<ProjectsTableDto>>(`${baseAPIURL}`, updatedProject)
    .then((res) => res.data);
};

/**
 * Deletes a project by its ID.
 */
const deleteProject = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple projects by their IDs.
 */
const deleteProjects = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a project based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<ProjectsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const projectOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<ProjectsTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertProject(payload as ProjectsTableDto);
    case "update":
      return updateProject(payload as ProjectsTableDto);
    case "delete":
      return deleteProject(payload as string);
    case "delete-multiple":
      return deleteProjects(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getProjects,
  isProjectNameAvailable,
  insertProject,
  updateProject,
  deleteProject,
  deleteProjects,
  projectOptimisticMutationFn,
};
