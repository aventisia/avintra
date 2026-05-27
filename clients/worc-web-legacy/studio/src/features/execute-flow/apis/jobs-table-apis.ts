import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

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
