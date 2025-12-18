import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { JobsTableDto } from "../dtos/jobs-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_URL}/job`;

/**
 * Retrieves list of Jobs.
 */
export const getJobs = () => {
  return axiosInstance
    .get<IHttpResponse<JobsTableDto[]>>(`${baseAPIURL}/list`)
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
