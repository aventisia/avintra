import { axiosInstance } from "@/react-toolkit/apis";
import { IHttpResponse, IOptimisticMutation } from "@/react-toolkit/dtos";
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
 * Performs an optimistic mutation on a project based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<ProjectsTableDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const projectOptimisticMutationFn = ({
  id,
  payload,
  crudAction,
}: IOptimisticMutation<ProjectsTableDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertProject(payload as ProjectsTableDto);
    case "update":
      return updateProject(payload as ProjectsTableDto);
    case "delete":
      return deleteProject(id);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getProjects,
  insertProject,
  updateProject,
  deleteProject,
  projectOptimisticMutationFn,
};
