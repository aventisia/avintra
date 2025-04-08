import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { ISelectOption } from "@/react-toolkit/types/select-option";

import { RolesTableDto } from "../dtos/roles-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/role`;

/**
 * Retrieves a list of roles.
 */
const getRoles = () => {
  return axiosInstance
    .get<IHttpResponse<RolesTableDto[]>>(`${baseAPIURL}`)
    .then((res) => res.data);
};

/**
 * Retrieves the account roles basis current role (role-manager) top role.
 */
const getRoleRoles = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/roles-to-select`)
    .then((res) => res.data);
};

/**
 * Inserts a new role.
 */
const insertRole = (newRole: RolesTableDto) => {
  return axiosInstance
    .post<IHttpResponse<RolesTableDto>>(`${baseAPIURL}`, newRole)
    .then((res) => res.data);
};

/**
 * Updates an role.
 */
const updateRole = (updatedRole: RolesTableDto) => {
  return axiosInstance
    .put<IHttpResponse<RolesTableDto>>(`${baseAPIURL}`, updatedRole)
    .then((res) => res.data);
};

/**
 * Deletes an role.
 */
const deleteRole = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Disable multiple roles by their IDs.
 */
const disableRoles = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/disable-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a role based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<RolesTableDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const roleOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<RolesTableDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertRole(payload as RolesTableDto);
    case "update":
      return updateRole(payload as RolesTableDto);
    case "delete":
      return deleteRole(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getRoles,
  getRoleRoles,
  insertRole,
  updateRole,
  deleteRole,
  disableRoles,
  roleOptimisticMutationFn,
};
