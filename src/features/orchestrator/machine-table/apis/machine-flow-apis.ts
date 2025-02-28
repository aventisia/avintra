import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { MachineFlowDto } from "../dtos/machine-flow-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/project`;

/**
 * Retrieves list of projects.
 */
export const getMachines = () => {
  return axiosInstance
    .get<IHttpResponse<MachineFlowDto[]>>(`${baseAPIURL}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a project name.
 */
export const isMachineNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new project.
 */
export const insertProject = (newProject: MachineFlowDto) => {
  return axiosInstance
    .post<IHttpResponse<MachineFlowDto>>(`${baseAPIURL}`, newProject)
    .then((res) => res.data);
};

/**
 * Updates an existing project.
 */
export const updateProject = (updatedProject: MachineFlowDto) => {
  return axiosInstance
    .put<IHttpResponse<MachineFlowDto>>(`${baseAPIURL}`, updatedProject)
    .then((res) => res.data);
};

/**
 * Deletes a project by its ID.
 */
export const deleteProject = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple projects by their IDs.
 */
export const deleteProjects = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a project based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<MachineFlowDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const machineFlowOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<MachineFlowDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertProject(payload as MachineFlowDto);
    case "update":
      return updateProject(payload as MachineFlowDto);
    case "delete":
      return deleteProject(payload as string);
    case "delete-multiple":
      return deleteProjects(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

