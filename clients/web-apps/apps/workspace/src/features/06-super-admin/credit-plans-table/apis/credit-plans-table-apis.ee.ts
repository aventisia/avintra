import { IHttpResponse, IOptimisticMutation } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { CreditPlansTableDto } from "../dtos/credit-plans-table-dto.ee";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/credit-plans`;

/**
 * Retrieves all Credit Plans created by user
 */
const getCreditPlans = () => {
  return axiosInstance
    .get<IHttpResponse<CreditPlansTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Get credit Plan by id.
 */
const getCreditPlan = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<CreditPlansTableDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Inserts a new Credit Plan.
 */
const insertCreditPlan = (newCreditPlan: CreditPlansTableDto) => {
  return axiosInstance
    .post<IHttpResponse<CreditPlansTableDto>>(`${baseAPIURL}`, newCreditPlan)
    .then((res) => res.data);
};

/**
 * Updates an existing Credit Plan.
 */
const updateCreditPlan = (updateCreditPlan: CreditPlansTableDto) => {
  return axiosInstance
    .put<IHttpResponse<CreditPlansTableDto>>(`${baseAPIURL}`, updateCreditPlan)
    .then((res) => res.data);
};

/**
 * Deletes a credit Plan by its ID.
 */
const deleteCreditPlan = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple credit plans by their IDs.
 */
const deleteCreditPlans = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a model based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<ModelsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const creditOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<CreditPlansTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertCreditPlan(payload as CreditPlansTableDto);
    case "update":
      return updateCreditPlan(payload as CreditPlansTableDto);
    case "delete":
      return deleteCreditPlan(payload as string);
    case "delete-multiple":
      return deleteCreditPlans(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getCreditPlan,
  getCreditPlans,
  insertCreditPlan,
  updateCreditPlan,
  deleteCreditPlan,
  deleteCreditPlans,
  creditOptimisticMutationFn,
};
