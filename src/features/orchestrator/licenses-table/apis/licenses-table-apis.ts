import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { ISelectOption } from "@/react-toolkit/types/select-option";

import { MyLicensesTableDto } from "../dtos/licenses-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/license-credit`;

/**
 * Retrieves list of licenses.
 */
export const getMyLicenses = () => {
  return axiosInstance
    .get<IHttpResponse<MyLicensesTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves list of licenses.
 */
export const getMyPricingPlans = () => {
  return axiosInstance
    .get<
      IHttpResponse<MyLicensesTableDto[]>
    >(`${import.meta.env.VITE_ACCOUNTS_API_URL}/pricing-plan/plans-to-select`)
    .then((res) => res.data);
};

/**
 * Retrieves list of license by id.
 */
export const getLicense = (id?: string) => {
  id = id && !id?.includes("00000000") ? id : "";
  return axiosInstance
    .get<IHttpResponse<MyLicensesTableDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

export const getLicensesToSelect = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/license-to-select`)
    .then((res) => res.data);
};

/**
 * Inserts a new license request.
 */
export const insertLicenseRequest = (newLicense: MyLicensesTableDto) => {
  return axiosInstance
    .post<
      IHttpResponse<MyLicensesTableDto>
    >(`${baseAPIURL}/request`, newLicense)
    .then((res) => res.data);
};

/**
 * Updates an existing license request.
 */
export const updateLicenseRequest = (updatedLicense: MyLicensesTableDto) => {
  return axiosInstance
    .put<IHttpResponse<MyLicensesTableDto>>(`${baseAPIURL}`, updatedLicense)
    .then((res) => res.data);
};

/**
 * Deletes a license request by its ID.
 */
export const deleteLicense = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a license based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<MyLicensesTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const licenseOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<MyLicensesTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertLicenseRequest(payload as MyLicensesTableDto);
    case "update":
      return updateLicenseRequest(payload as MyLicensesTableDto);
    case "delete":
      return deleteLicense(payload as string);
    default:
      throw new Error("Invalid action type");
  }
};
