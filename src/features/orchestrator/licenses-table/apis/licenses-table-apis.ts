import { IHttpResponse } from '@/react-toolkit/dtos/http-response';
import { IOptimisticMutation } from '@/react-toolkit/dtos/optimistic-mutation';
import { CheckAvailabilityDto } from '@/react-toolkit/dtos/request/check-availability-dto';
import { TrueFalseResultDto } from '@/react-toolkit/dtos/response/true-false-result-dto';
import { axiosInstance } from '@/react-toolkit/lib/axios-instance';

import { LicensesTableDto } from '../dtos/licenses-table-dto';

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/queue`;

/**
 * Retrieves list of licenses.
 */
const getLicenses = () => {
  return axiosInstance
    .get<IHttpResponse<LicensesTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a license name.
 */
const isLicenseNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new license.
 */
const insertLicense = (newLicense: LicensesTableDto) => {
  return axiosInstance
    .post<IHttpResponse<LicensesTableDto>>(`${baseAPIURL}`, newLicense)
    .then((res) => res.data);
};

/**
 * Updates an existing license.
 */
const updateLicense = (updatedLicense: LicensesTableDto) => {
  return axiosInstance
    .put<IHttpResponse<LicensesTableDto>>(`${baseAPIURL}`, updatedLicense)
    .then((res) => res.data);
};

/**
 * Deletes a license by its ID.
 */
const deleteLicense = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple licenses by their IDs.
 */
const deleteLicenses = (ids: string[]) => {
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
const licenseOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<LicensesTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertLicense(payload as LicensesTableDto);
    case "update":
      return updateLicense(payload as LicensesTableDto);
    case "delete":
      return deleteLicense(payload as string);
    case "delete-multiple":
      return deleteLicenses(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getLicenses,
  isLicenseNameAvailable,
  insertLicense,
  updateLicense,
  deleteLicense,
  deleteLicenses,
  licenseOptimisticMutationFn,
};
