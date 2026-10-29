import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";
import { UserSessionDto } from "@avplatform/ui/dtos/response/user-session-dto";
import { ISelectOption } from "@avplatform/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { TenantPublishedAgentDto } from "../dtos/tenant-published-agent-dto.ee";
import { TenantsTableDto } from "../dtos/tenants-table-dto.ee";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant`;
const saWorkspaceAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/sa`;

/**
 * Retrieves list of tenants.
 */
const getTenants = (startDate: string = "", endDate: string = "") => {
  return axiosInstance
    .get<IHttpResponse<TenantsTableDto[]>>(
      `${baseAPIURL}?startDate=${startDate}&endDate=${endDate}`,
    )
    .then((res) => res.data);
};

export const getTenantsToSelect = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/tenants-to-select`)
    .then((res) => res.data);
};

export const getCurrenciesToSelect = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/currencies-to-select`)
    .then((res) => res.data);
};

export const searchTenantsToSearchSelect = async (query?: string) => {
  const data = await axiosInstance
    .post<IHttpResponse<ISelectOption[]>>(
      `${baseAPIURL}/tenants-to-search-select`,
      {
        userInput: query ?? null,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => res.data);
  return Promise.resolve(data.data);
};

export const getTenantDetails = (id?: string | null) => {
  if (!id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.resolve<IHttpResponse<any>>({
      statusCode: 201,
      message: "",
      data: {
        name: "id not provided",
        effectiveDate: new Date(),
        renewalDate: new Date(),
      },
    });
  return axiosInstance
    .get<IHttpResponse<TenantsTableDto>>(`${baseAPIURL}/${id ?? ""}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a tenant name.
 */
const isTenantNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj)
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
 * Switch a tenant by its ID.
 */
const switchTenant = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<UserSessionDto>>(
      `${import.meta.env.VITE_ACCOUNTS_API_PATH}/sa/tenants/auth/tokens`,
      {},
      { headers: { "X-TENANT-ID": id } },
    )
    .then((res) => res.data);
};

/**
 * Deletes a tenant by its ID.
 */
const deleteTenant = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${import.meta.env.VITE_ACCOUNTS_API_PATH}/sa/tenant`, {
      headers: { "X-TENANT-ID": id },
    })
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
 * @param {IOptimisticMutation<TenantsTableDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const tenantOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<TenantsTableDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertTenant(payload as TenantsTableDto);
    case "update":
      return updateTenant(payload as TenantsTableDto);
    case "delete":
      return deleteTenant(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};

/**
 * Retrieves the list of published agents for a specific tenant.
 */
const getTenantPublishedAgents = (tenantId: string) => {
  return axiosInstance
    .get<IHttpResponse<TenantPublishedAgentDto[]>>(
      `${saWorkspaceAPIURL}/tenant/${tenantId}/published-agents`,
    )
    .then((res) => res.data);
};

/**
 * Sets the fixed credits limit for a published agent.
 */
const setFixedCredits = (flowVersionId: string, fixedCredits: number | null) => {
  return axiosInstance
    .put<IHttpResponse<boolean>>(
      `${saWorkspaceAPIURL}/agent/${flowVersionId}/fixed-credits`,
      fixedCredits,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => res.data);
};

export {
  getTenants,
  isTenantNameAvailable,
  insertTenant,
  updateTenant,
  deleteTenant,
  disableTenants,
  tenantOptimisticMutationFn,
  switchTenant,
  getTenantPublishedAgents,
  setFixedCredits,
};
