import { IHttpResponse } from '@/react-toolkit/dtos/http-response'
import { IOptimisticMutation } from '@/react-toolkit/dtos/optimistic-mutation'
import { CheckAvailabilityDto } from '@/react-toolkit/dtos/request/check-availability-dto'
import { TrueFalseResultDto } from '@/react-toolkit/dtos/response/true-false-result-dto'
import { axiosInstance } from '@/react-toolkit/lib/axios-instance'

import { PricingPlansTableDto } from '../dtos/pricingPlans-table-dto'

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/plan`;

/**
 * Retrieves list of pricingplans.
 */
const getPricingPlans = () => {
  return axiosInstance
    .get<IHttpResponse<PricingPlansTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a pricingplan name.
 */
const isPricingPlanNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new pricingplan.
 */
const insertPricingPlan = (newPricingPlan: PricingPlansTableDto) => {
  return axiosInstance
    .post<IHttpResponse<PricingPlansTableDto>>(`${baseAPIURL}`, newPricingPlan)
    .then((res) => res.data);
};

/**
 * Updates an existing pricingplan.
 */
const updatePricingPlan = (updatedPricingPlan: PricingPlansTableDto) => {
  return axiosInstance
    .put<
      IHttpResponse<PricingPlansTableDto>
    >(`${baseAPIURL}`, updatedPricingPlan)
    .then((res) => res.data);
};

/**
 * Deletes a pricingplan by its ID.
 */
const deletePricingPlan = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Disable multiple pricingplans by their IDs.
 */
const deletePricingPlans = (ids: string[]) => {
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
const pricingPlanOptimisticMutationFn = ({
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
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getPricingPlans,
  isPricingPlanNameAvailable,
  insertPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  deletePricingPlans as disablePricingPlans,
  pricingPlanOptimisticMutationFn,
};
