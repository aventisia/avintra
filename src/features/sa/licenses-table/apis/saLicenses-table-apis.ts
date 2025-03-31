import { IHttpResponse } from '@/react-toolkit/dtos/http-response';
import { IOptimisticMutation } from '@/react-toolkit/dtos/optimistic-mutation';
import { CheckAvailabilityDto } from '@/react-toolkit/dtos/request/check-availability-dto';
import { TrueFalseResultDto } from '@/react-toolkit/dtos/response/true-false-result-dto';
import { axiosInstance } from '@/react-toolkit/lib/axios-instance';

import { SaLicensesTableDto } from '../dtos/saLicenses-table-dto';

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/queue`;

/**
 * Retrieves list of licenses.
 */
const getSaLicenses = () => {
  return axiosInstance
    .get<IHttpResponse<SaLicensesTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a license name.
 */
const isSaLicenseNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new license.
 */
const insertSaLicense = (newLicense: SaLicensesTableDto) => {
  return axiosInstance
    .post<IHttpResponse<SaLicensesTableDto>>(`${baseAPIURL}`, newLicense)
    .then((res) => res.data);
};

/**
 * Updates an existing license.
 */
const updateSaLicense = (updatedLicense: SaLicensesTableDto) => {
  return axiosInstance
    .put<IHttpResponse<SaLicensesTableDto>>(`${baseAPIURL}`, updatedLicense)
    .then((res) => res.data);
};

/**
 * Deletes a license by its ID.
 */
const deleteSaLicense = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple licenses by their IDs.
 */
const deleteSaLicenses = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a license based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<SaLicensesTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const saLicenseOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<SaLicensesTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertSaLicense(payload as SaLicensesTableDto);
    case "update":
      return updateSaLicense(payload as SaLicensesTableDto);
    case "delete":
      return deleteSaLicense(payload as string);
    case "delete-multiple":
      return deleteSaLicenses(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getSaLicenses,
  isSaLicenseNameAvailable,
  insertSaLicense,
  updateSaLicense,
  deleteSaLicense,
  deleteSaLicenses,
  saLicenseOptimisticMutationFn,
};
