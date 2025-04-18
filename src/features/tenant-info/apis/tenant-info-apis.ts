import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { TenantDto } from "../dtos/tenant-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/tenant`;

/**
 * Retrieves list of tenants.
 */
const getTenants = () => {
  return axiosInstance
    .get<IHttpResponse<TenantDto[]>>(`${baseAPIURL}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a tenant name.
 */
const isTenantNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new tenant.
 */
const insertTenant = (newTenant: TenantDto) => {
  return axiosInstance
    .post<IHttpResponse<TenantDto>>(`${baseAPIURL}`, newTenant)
    .then((res) => res.data);
};

/**
 * Updates an existing tenant.
 */
const updateTenant = (updatedTenant: TenantDto) => {
  return axiosInstance
    .put<IHttpResponse<TenantDto>>(`${baseAPIURL}`, updatedTenant)
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
 * Disable multiple tenants by their IDs.
 */
const disableTenants = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/disable-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a tenant based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<TenantDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const tenantOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<TenantDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertTenant(payload as TenantDto);
    case "update":
      return updateTenant(payload as TenantDto);
    case "delete":
      return deleteTenant(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getTenants,
  isTenantNameAvailable,
  insertTenant,
  updateTenant,
  deleteTenant,
  disableTenants,
  tenantOptimisticMutationFn,
};
