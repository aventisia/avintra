import { IHttpResponse, IOptimisticMutation } from "@aventisia/ui/dtos";
import { ISelectOption } from "@aventisia/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { RecordPaymentDto } from "../dtos/record-payment-dto";
import { RequestLicensesDto } from "../dtos/request-license-dto";
import { LicensesTableDto } from "../dtos/sa-licenses-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/manage-license-credit`;

/**
 * Retrieves list of licenses.
 */
export const getLicenses = () => {
  return axiosInstance
    .get<IHttpResponse<LicensesTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};
/**
 * Retrieves list of license by id.
 */
export const getLicense = (id?: string) => {
  id = id && !id?.includes("00000000") ? id : "";
  return axiosInstance
    .get<IHttpResponse<LicensesTableDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

export const getLicensesToSelect = (tenantId?: string) => {
  tenantId = tenantId && !tenantId?.includes("00000000") ? tenantId : "";

  return axiosInstance
    .get<
      IHttpResponse<ISelectOption[]>
    >(`${baseAPIURL}/license-to-select/${tenantId}`)
    .then((res) => res.data);
};

/**
 * Inserts a new license request.
 */
export const insertLicense = (newLicense: LicensesTableDto) => {
  return axiosInstance
    .post<IHttpResponse<LicensesTableDto>>(`${baseAPIURL}`, newLicense)
    .then((res) => res.data);
};

/**
 * Inserts a new license request.
 */
export const requestLicense = (newLicense: RequestLicensesDto) => {
  return axiosInstance
    .post<
      IHttpResponse<RequestLicensesDto>
    >(`${baseAPIURL}/request`, newLicense)
    .then((res) => res.data);
};

/**
 * Inserts a new license request.
 */
export const recordPaymnet = (payment: RecordPaymentDto) => {
  return axiosInstance
    .post<IHttpResponse<RequestLicensesDto>>(`${baseAPIURL}/record`, payment)
    .then((res) => res.data);
};

/**
 * Updates an existing license request.
 */
export const updateLicense = (updatedLicense: LicensesTableDto) => {
  return axiosInstance
    .put<IHttpResponse<LicensesTableDto>>(`${baseAPIURL}`, updatedLicense)
    .then((res) => res.data);
};

/**
 * approve requested license units.
 */
export const approveRequestedLicense = (requestedLicense: LicensesTableDto) => {
  return axiosInstance
    .post<
      IHttpResponse<LicensesTableDto>
    >(`${baseAPIURL}/approve`, requestedLicense)
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

export const deleteLicenses = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a license based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<LicensesTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const saLicenseOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<
  LicensesTableDto | RequestLicensesDto | string | string[]
>) => {
  switch (crudAction) {
    case "create":
      return insertLicense(payload as LicensesTableDto);
    case "update":
      return approveRequestedLicense(payload as LicensesTableDto);
    case "delete":
      return deleteLicense(payload as string);
    case "delete-multiple":
      return deleteLicenses(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
