import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { IOptimisticMutation } from "@aventisia/ui/dtos";
import { CheckAvailabilityDto } from "@aventisia/ui/dtos";
import { TrueFalseResultDto } from "@aventisia/ui/dtos";

import { BillingAddressDto } from "../dtos/billing-address-dto";
import { InovicesTableDto } from "../dtos/inovices-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/address`;

/**
 * Retrieves list of inovices.
 */
export const getInovices = () => {
  return axiosInstance
    .get<
      IHttpResponse<InovicesTableDto[]>
    >(`${import.meta.env.VITE_ACCOUNTS_API_URL}/invoice/list`)
    .then((res) => res.data);
};

/**
 * Retrieves list of billing addresses.
 */
export const getAddresses = () => {
  return axiosInstance
    .get<IHttpResponse<BillingAddressDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of name.
 */
export const isInoviceNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new billing address.
 */
export const insertAddres = (newBillingPlan: InovicesTableDto) => {
  return axiosInstance
    .post<IHttpResponse<InovicesTableDto>>(`${baseAPIURL}`, newBillingPlan)
    .then((res) => res.data);
};

/**
 * Updates an existing billing address.
 */
export const updateAddress = (updatedBillingPlan: InovicesTableDto) => {
  return axiosInstance
    .put<IHttpResponse<InovicesTableDto>>(`${baseAPIURL}`, updatedBillingPlan)
    .then((res) => res.data);
};

/**
 * Deletes a billing address by its ID.
 */
export const deleteAddress = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Disable multiple addresses by their IDs.
 */
export const setDefault = (ids: string[]) => {
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
      return insertAddres(payload as InovicesTableDto);
    case "update":
      return updateAddress(payload as InovicesTableDto);
    case "delete":
      return deleteAddress(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};
