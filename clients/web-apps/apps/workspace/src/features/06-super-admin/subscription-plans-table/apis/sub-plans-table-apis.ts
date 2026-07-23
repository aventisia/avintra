import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { SubPlansTableDto } from "../dtos/sub-plans-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/subscription-plans`;

/**
 * Retrieves all subPlans created by user
 */
const getSubPlans = (type?: string) => {
  return axiosInstance
    .get<IHttpResponse<SubPlansTableDto[]>>(
      type ? `${baseAPIURL}/list?type=${type}` : `${baseAPIURL}/list`,
    )
    .then((res) => res.data);
};

/**
 * Checks the availability of a subPlan name.
 */
const isSubPlanNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new subPlan.
 */
const insertSubPlan = (newSubPlan: SubPlansTableDto) => {
  return axiosInstance
    .post<IHttpResponse<SubPlansTableDto>>(`${baseAPIURL}`, newSubPlan)
    .then((res) => res.data);
};

/**
 * Updates an existing subPlan.
 */
const updateSubPlan = (updatedSubPlan: SubPlansTableDto) => {
  return axiosInstance
    .put<IHttpResponse<SubPlansTableDto>>(`${baseAPIURL}`, updatedSubPlan)
    .then((res) => res.data);
};

/**
 * Deletes a subPlan by its ID.
 */
const deleteSubPlan = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple SubPlans by their IDs.
 */
const deleteSubPlans = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a subPlan based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<SubPlansTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const subPlanOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<SubPlansTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertSubPlan(payload as SubPlansTableDto);
    case "update":
      return updateSubPlan(payload as SubPlansTableDto);
    case "delete":
      return deleteSubPlan(payload as string);
    case "delete-multiple":
      return deleteSubPlans(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getSubPlans,
  isSubPlanNameAvailable,
  insertSubPlan,
  updateSubPlan,
  deleteSubPlan,
  deleteSubPlans,
  subPlanOptimisticMutationFn,
};
