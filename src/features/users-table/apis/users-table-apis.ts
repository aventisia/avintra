import { axiosInstance } from "@/react-toolkit/apis";
import { IHttpResponse, IOptimisticMutation } from "@/react-toolkit/dtos";
import { UsersTableDto } from "../dtos/users-table-dto";
import { ISelectOption } from "@/react-toolkit/types";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/user`;

/**
 * Retrieves a user by its ID.
 */
const getUser = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<UsersTableDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Retrieves list of users.
 */
const getUsers = () => {
  return axiosInstance
    .get<IHttpResponse<UsersTableDto[]>>(`${baseAPIURL}`)
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
 * Updates an existing user.
 */
const updateUser = (updatedUser: UsersTableDto) => {
  return axiosInstance
    .put<IHttpResponse<UsersTableDto>>(`${baseAPIURL}`, updatedUser)
    .then((res) => res.data);
};

/**
 * Deletes a user by its ID.
 */
const deleteUser = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Retrieves list of users.
 */
const getUserRoles = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/roles-to-select`)
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
  id,
  payload,
  crudAction,
}: IOptimisticMutation<UsersTableDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertUser(payload as UsersTableDto);
    case "update":
      return updateUser(payload as UsersTableDto);
    case "delete":
      return deleteUser(id);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getUser,
  getUsers,
  insertUser,
  updateUser,
  deleteUser,
  getUserRoles,
  userOptimisticMutationFn,
};
