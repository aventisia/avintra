import { IHttpResponse, IOptimisticMutation } from "@avplatform/ui/dtos";
import { ISelectOption } from "@avplatform/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { UsersTableDto } from "../dtos/users-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/user`;

/**
 * Retrieves a list of users.
 */
const getUsers = () => {
  return axiosInstance.get<IHttpResponse<UsersTableDto[]>>(`${baseAPIURL}`).then((res) => res.data);
};

/**
 * Retrieves the account roles basis current user (user-manager) top role.
 */
const getUserRoles = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/roles-to-select`)
    .then((res) => res.data);
};

/**
 * Inserts a new user.
 */
const insertUser = (newUser: UsersTableDto) => {
  return axiosInstance
    .post<IHttpResponse<UsersTableDto>>(`${baseAPIURL}`, newUser)
    .then((res) => res.data);
};

/**
 * Updates an user.
 */
const updateUser = (updatedUser: UsersTableDto) => {
  return axiosInstance
    .put<IHttpResponse<UsersTableDto>>(`${baseAPIURL}`, updatedUser)
    .then((res) => res.data);
};

/**
 * Deletes an user.
 */
const deleteUser = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Disable multiple users by their IDs.
 */
const disableUsers = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/disable-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a user based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<UsersTableDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const userOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<UsersTableDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertUser(payload as UsersTableDto);
    case "update":
      return updateUser(payload as UsersTableDto);
    case "delete":
      return deleteUser(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getUsers,
  getUserRoles,
  insertUser,
  updateUser,
  deleteUser,
  disableUsers,
  userOptimisticMutationFn,
};
