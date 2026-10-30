import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { appendAuthHeader } from "../../on-prem-tenant/utils/appendAuthHeader.ee";
import { OnPremInstanceDto } from "../dtos/tenant-instance-dto.ee";
import { OnpremInstanceStaticDto } from "../dtos/tenant-statistics-dto.ee";

const baseAPIURL: string = `${import.meta.env.VITE_GLOBALADMIN_API_URL}/onprem/instance`;

/**
 * Retrieves all TenantInstances created by user
 */
const getTenantInstances = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<OnPremInstanceDto[]>>(`${baseAPIURL}/${id}/list`, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Retrieve TenantInstance by ID
 */
const getTenantInstanceById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<OnPremInstanceDto>>(`${baseAPIURL}/${id}`, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Retrieve Tenant statistics by ID
 */
const getTenantStatistics = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<OnpremInstanceStaticDto>>(
      `${import.meta.env.VITE_GLOBALADMIN_API_URL}/onprem-tenant/${id}/statistics`,
      appendAuthHeader(),
    )
    .then((res) => res.data);
};

/**
 * Checks the availability of a TenantInstance name.
 */
const isTenantInstanceNameAvailable = (tenantId: string, postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(
      `${baseAPIURL}/${tenantId}/is-available`,
      postObj,
      appendAuthHeader(),
    )
    .then((res) => res.data);
};

/**
 * Inserts a new TenantInstance.
 */
const insertTenantInstance = (newTenantInstance: OnPremInstanceDto) => {
  return axiosInstance
    .post<IHttpResponse<OnPremInstanceDto>>(`${baseAPIURL}`, newTenantInstance, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Updates an existing TenantInstance.
 */
const updateTenantInstance = (updatedTenantInstance: OnPremInstanceDto) => {
  return axiosInstance
    .put<IHttpResponse<OnPremInstanceDto>>(
      `${baseAPIURL}`,
      updatedTenantInstance,
      appendAuthHeader(),
    )
    .then((res) => res.data);
};

/**
 * Deletes a TenantInstance by its ID.
 */
const deleteTenantInstance = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Deletes multiple TenantInstances by their IDs.
 */
const deleteTenantInstances = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a TenantInstance based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<OnPremInstanceDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const TenantInstanceOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<OnPremInstanceDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertTenantInstance(payload as OnPremInstanceDto);
    case "update":
      return updateTenantInstance(payload as OnPremInstanceDto);
    case "delete":
      return deleteTenantInstance(payload as string);
    case "delete-multiple":
      return deleteTenantInstances(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getTenantInstances,
  getTenantInstanceById,
  isTenantInstanceNameAvailable,
  insertTenantInstance,
  updateTenantInstance,
  deleteTenantInstance,
  deleteTenantInstances,
  getTenantStatistics,
  TenantInstanceOptimisticMutationFn,
};
