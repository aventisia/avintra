import { TenantsTableDto } from "@/features/tenants-table";
import { axiosInstance } from "@/react-toolkit/apis";
import { IHttpResponse, IOptimisticMutation } from "@/react-toolkit/dtos";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/tenant`;

/**
 * Retrieves list of tenants.
 */
const getTenants = () => {
  return axiosInstance
    .get<IHttpResponse<TenantsTableDto[]>>(`${baseAPIURL}`)
    .then((res) => res.data);
};

/**
 * Inserts a new tenant.
 */
const insertTenant = (newTenant: TenantsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<TenantsTableDto>>(`${baseAPIURL}`, newTenant)
    .then((res) => res.data);
};

/**
 * Updates an existing tenant.
 */
const updateTenant = (updatedTenant: TenantsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<TenantsTableDto>>(`${baseAPIURL}`, updatedTenant)
    .then((res) => res.data);
};

/**
 * Deletes a tenant by its ID.
 */
const deleteTenant = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a tenant based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<TenantsTableDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const tenantOptimisticMutationFn = ({
  id,
  payload,
  crudAction,
}: IOptimisticMutation<TenantsTableDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertTenant(payload as TenantsTableDto);
    case "update":
      return updateTenant(payload as TenantsTableDto);
    case "delete":
      return deleteTenant(id);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getTenants,
  insertTenant,
  updateTenant,
  deleteTenant,
  tenantOptimisticMutationFn,
};
