import { IHttpResponse, IOptimisticMutation } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { SpacesTableDto } from "../dtos/spaces-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/space`;

/**
 * Retrieves a list of spaces.
 */
const getSpaces = () => {
  return axiosInstance
    .get<IHttpResponse<SpacesTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Inserts a new space.
 */
const insertSpace = (newSpace: SpacesTableDto) => {
  return axiosInstance
    .post<IHttpResponse<SpacesTableDto>>(`${baseAPIURL}`, newSpace)
    .then((res) => res.data);
};

/**
 * Updates an existing space.
 */
const updateSpace = (updatedSpace: SpacesTableDto) => {
  return axiosInstance
    .put<IHttpResponse<SpacesTableDto>>(`${baseAPIURL}`, updatedSpace)
    .then((res) => res.data);
};

/**
 * Deletes a space by its unique identifier.
 */
const deleteSpace = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a space based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<SpacesTableDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const spaceOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<SpacesTableDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertSpace(payload as SpacesTableDto);
    case "update":
      return updateSpace(payload as SpacesTableDto);
    case "delete":
      return deleteSpace(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};

export { getSpaces, insertSpace, updateSpace, deleteSpace, spaceOptimisticMutationFn };
