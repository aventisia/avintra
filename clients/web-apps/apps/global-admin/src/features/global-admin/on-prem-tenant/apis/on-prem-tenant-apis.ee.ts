import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { appendAuthHeader } from "@/utils/appendAuthHeader.ee";

import { OnPremTenantDto } from "../dtos/on-prem-tenant-dto.ee";

const baseAPIURL: string = `${import.meta.env.VITE_GLOBALADMIN_API_URL}/onprem-tenant`;

/**
 * Retrieves all OnPremTenants created by user
 */
const getOnPremTenants = () => {
  return axiosInstance
    .get<IHttpResponse<OnPremTenantDto[]>>(`${baseAPIURL}/list`, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Retrieve OnPremTenant by ID
 */
const getOnPremTenantById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<OnPremTenantDto>>(`${baseAPIURL}/${id}`, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Checks the availability of a OnPremTenant name.
 */
const isOnPremTenantNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(
      `${baseAPIURL}/is-available`,
      postObj,
      appendAuthHeader(),
    )
    .then((res) => res.data);
};

/**
 * Inserts a new OnPremTenant.
 */
const createOnPremTenant = (newOnPremTenant: OnPremTenantDto) => {
  return axiosInstance
    .post<IHttpResponse<OnPremTenantDto>>(`${baseAPIURL}`, newOnPremTenant, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Updates an existing OnPremTenant.
 */
const updateOnPremTenant = (updatedOnPremTenant: OnPremTenantDto) => {
  return axiosInstance
    .put<IHttpResponse<OnPremTenantDto>>(`${baseAPIURL}`, updatedOnPremTenant, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Deletes a OnPremTenant by its ID.
 */
const deleteOnPremTenant = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Deletes multiple OnPremTenants by their IDs.
 */
const deleteMultipleOnPremTenants = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a OnPremTenant based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<OnPremTenantDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const OnPremTenantOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<OnPremTenantDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return createOnPremTenant(payload as OnPremTenantDto);
    case "update":
      return updateOnPremTenant(payload as OnPremTenantDto);
    case "delete":
      return deleteOnPremTenant(payload as string);
    case "delete-multiple":
      return deleteMultipleOnPremTenants(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getOnPremTenants,
  getOnPremTenantById,
  isOnPremTenantNameAvailable,
  createOnPremTenant,
  updateOnPremTenant,
  deleteOnPremTenant,
  deleteMultipleOnPremTenants,
  OnPremTenantOptimisticMutationFn,
};
