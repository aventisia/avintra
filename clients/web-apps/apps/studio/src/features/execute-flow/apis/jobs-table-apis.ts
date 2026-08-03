import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { JobDetailsDto } from "../dtos/jobs-details-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/job`;

/**
 * Inserts a new job.
 */
export const insertJob = (newJob: JobDetailsDto) => {
  return axiosInstance
    .post<IHttpResponse<JobDetailsDto>>(`${baseAPIURL}`, newJob)
    .then((res) => res.data);
};

/**
 * Retrieves Job data.
 */
export const getJobById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<JobDetailsDto>>(`${baseAPIURL}/detail/${id}`)
    .then((res) => res.data);
};

export const updateJobData = (data: JobDetailsDto) => {
  return axiosInstance
    .put<IHttpResponse<JobDetailsDto>>(`${baseAPIURL}`, data)
    .then((res) => res.data);
};
