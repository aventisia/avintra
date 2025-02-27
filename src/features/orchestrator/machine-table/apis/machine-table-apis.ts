import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { MachineTableDto } from "../dtos/machine-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/project`;

/**
 * Retrieves list of projects.
 */
const getProjects = () => {
  return axiosInstance
    .get<IHttpResponse<MachineTableDto[]>>(`${baseAPIURL}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a project name.
 */
const isMachineNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new project.
 */
const insertProject = (newProject: MachineTableDto) => {
  return axiosInstance
    .post<IHttpResponse<MachineTableDto>>(`${baseAPIURL}`, newProject)
    .then((res) => res.data);
};

/**
 * Updates an existing project.
 */
const updateProject = (updatedProject: MachineTableDto) => {
  return axiosInstance
    .put<IHttpResponse<MachineTableDto>>(`${baseAPIURL}`, updatedProject)
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
 * @param {IOptimisticMutation<MachineTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const machineOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<MachineTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertProject(payload as MachineTableDto);
    case "update":
      return updateProject(payload as MachineTableDto);
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
  isMachineNameAvailable,
  insertProject,
  updateProject,
  deleteProject,
  deleteProjects,
  machineOptimisticMutationFn,
};
