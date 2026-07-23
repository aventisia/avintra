import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { RoleTableDTO } from "../dtos/roles-table-dto";

export const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-role`;

/**
 * Retrieves list of Documents.
 */
export const getRoles = () => {
  return axiosInstance
    .get<IHttpResponse<RoleTableDTO[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieve a specific Documents.
 */
export const getRole = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<RoleTableDTO>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a project name.
 */
export const isRoleNameAvailable = (roleObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, roleObj)
    .then((res) => res.data);
};

/**
 * Inserts a new Document.
 */
export const insertRole = (newRole: RoleTableDTO) => {
  return axiosInstance
    .post<IHttpResponse<RoleTableDTO>>(`${baseAPIURL}`, newRole)
    .then((res) => res.data);
};

/**
 * Updates an existing Document.
 */
export const updateRole = (updatedRole: RoleTableDTO) => {
  return axiosInstance
    .put<IHttpResponse<RoleTableDTO>>(`${baseAPIURL}`, updatedRole)
    .then((res) => res.data);
};

/**
 * Deletes a document by its ID.
 */
export const deleteRole = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple projects by their IDs.
 */
export const deleteRoles = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a project based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<RoleTableDTO | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const roleOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<RoleTableDTO | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertRole(payload as RoleTableDTO);
    case "update":
      return updateRole(payload as RoleTableDTO);
    case "delete":
      return deleteRole(payload as string);
    case "delete-multiple":
      return deleteRoles(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
