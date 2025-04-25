import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { BillingAddressDto } from "../dtos/billing-address-dto";
import { InovicesTableDto } from "../dtos/inovices-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/invoice`;

/**
 * Retrieves list of inovices.
 */
export const getBillingAddresses = () => {
  return axiosInstance
    .get<IHttpResponse<BillingAddressDto[]>>(`${baseAPIURL}`)
    .then((res) => res.data);
};

/**
 * Retrieves list of inovices.
 */
export const getInovices = () => {
  return axiosInstance
    .get<IHttpResponse<InovicesTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a billingplan name.
 */
export const isInoviceNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new billingplan.
 */
export const insertInovice = (newBillingPlan: InovicesTableDto) => {
  return axiosInstance
    .post<IHttpResponse<InovicesTableDto>>(`${baseAPIURL}`, newBillingPlan)
    .then((res) => res.data);
};

/**
 * Updates an existing billingplan.
 */
export const updateInovice = (updatedBillingPlan: InovicesTableDto) => {
  return axiosInstance
    .put<IHttpResponse<InovicesTableDto>>(`${baseAPIURL}`, updatedBillingPlan)
    .then((res) => res.data);
};

/**
 * Deletes a billingplan by its ID.
 */
export const deleteInovice = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Disable multiple inovices by their IDs.
 */
export const disableInovices = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/disable-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a billingplan based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<InovicesTableDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const inoviceOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<InovicesTableDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertInovice(payload as InovicesTableDto);
    case "update":
      return updateInovice(payload as InovicesTableDto);
    case "delete":
      return deleteInovice(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};
