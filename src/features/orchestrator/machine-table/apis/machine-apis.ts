import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { MachineDto } from "../dtos/machine-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/machine`;

/**
 * Retrieves list of projects.
 */
const getMachines = () => {
  return axiosInstance
    .get<IHttpResponse<MachineDto[]>>(`${baseAPIURL}/list`)
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
const insertMachine = (newProject: MachineDto) => {
  return axiosInstance
    .post<IHttpResponse<MachineDto>>(`${baseAPIURL}`, newProject)
    .then((res) => res.data);
};

/**
 * Updates an existing project.
 */
const updateMachine = (updatedProject: MachineDto) => {
  return axiosInstance
    .put<IHttpResponse<MachineDto>>(`${baseAPIURL}`, updatedProject)
    .then((res) => res.data);
};

/**
 * Deletes a project by its ID.
 */
const deleteMachine = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple projects by their IDs.
 */
const removeMachines = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a project based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<MachineDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const machineOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<MachineDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertMachine(payload as MachineDto);
    case "update":
      return updateMachine(payload as MachineDto);
    case "delete":
      return deleteMachine(payload as string);
    case "delete-multiple":
      return removeMachines(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getMachines,
  isMachineNameAvailable,
  insertMachine,
  updateMachine,
  deleteMachine,
  removeMachines,
  machineOptimisticMutationFn,
};
