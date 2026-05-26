import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { JobDetailsDto } from "../dtos/job-details-dto";
import { JobsTableDto } from "../dtos/jobs-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/job`;

/**
 * Retrieves list of Jobs.
 */
export const getJobs = (startDate: string = "", endDate: string = "") => {
  return axiosInstance
    .get<
      IHttpResponse<JobsTableDto[]>
    >(`${baseAPIURL}/list?startDate=${startDate}&endDate=${endDate}`)
    .then((res) => res.data);
};

/**
 * Retrieves Job data.
 */
export const getJobById = (id?: string) => {
  return axiosInstance
    .get<IHttpResponse<JobDetailsDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes a Job by its ID.
 */
export const deleteJob = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Abort a Job by its ID.
 */
export const abortJobExecution = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<JobsTableDto>>(`${baseAPIURL}/abort`, { id })
    .then((res) => res.data);
};
