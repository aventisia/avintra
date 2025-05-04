import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@aventisia/ui/dtos";
import { ISelectOption } from "@aventisia/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { PricingPlansTableDto } from "../dtos/pricingPlans-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/manage-pricing-plan`;

/**
 * Retrieves list of pricingplans.
 */
export const getPricingPlans = () => {
  return axiosInstance
    .get<IHttpResponse<PricingPlansTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves list of pricingplans.
 */
export const getPricingPlansToSelect = (tenantId?: string) => {
  return axiosInstance
    .get<
      IHttpResponse<ISelectOption[]>
    >(`${baseAPIURL}/plans-to-select/${tenantId}`)
    .then((res) => res.data);
};

/**
 * Retrieves list of pricingplan for tenant.
 */
export const getPricingPlansToSelectForTenant = () => {
  return axiosInstance
    .get<
      IHttpResponse<ISelectOption[]>
    >(`${import.meta.env.VITE_ACCOUNTS_API_URL}/pricing-plan/plans-to-select`)
    .then((res) => res.data);
};

/**
 * Retrieves list of pricingplan by id.
 */
export const getPricingPlan = (
  id?: string,
): Promise<IHttpResponse<PricingPlansTableDto>> => {
  if (!id)
    return Promise.resolve({
      data: {
        tenantId: "",
        pricingComponent: "",
        tenantType: "",
        tenantName: "",
        currency: "",
        unit: "",
        unitPrice: 0,
        frequency: "",
        cola: 0,
      },
      statusCode: 201,
      message: "",
    });

  return axiosInstance
    .get<IHttpResponse<PricingPlansTableDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a pricingplan name.
 */
export const isPricingPlanNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new pricingplan.
 */
export const insertPricingPlan = (newPricingPlan: PricingPlansTableDto) => {
  return axiosInstance
    .post<IHttpResponse<PricingPlansTableDto>>(`${baseAPIURL}`, newPricingPlan)
    .then((res) => res.data);
};

/**
 * Updates an existing pricingplan.
 */
export const updatePricingPlan = (updatedPricingPlan: PricingPlansTableDto) => {
  return axiosInstance
    .put<
      IHttpResponse<PricingPlansTableDto>
    >(`${baseAPIURL}`, updatedPricingPlan)
    .then((res) => res.data);
};

/**
 * Deletes a pricingplan by its ID.
 */
export const deletePricingPlan = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Disable multiple pricingplans by their IDs.
 */
export const deletePricingPlans = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a pricingplan based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<PricingPlansTableDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const pricingPlanOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<PricingPlansTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertPricingPlan(payload as PricingPlansTableDto);
    case "update":
      return updatePricingPlan(payload as PricingPlansTableDto);
    case "delete":
      return deletePricingPlan(payload as string);
    case "delete-multiple":
      return deletePricingPlans(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
