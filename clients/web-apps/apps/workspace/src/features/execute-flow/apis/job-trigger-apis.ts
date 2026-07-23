import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { JobDetailsDto } from "../dtos/job-details-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/job`;

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

export const abortJobExecution = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<JobDetailsDto>>(`${baseAPIURL}/abort`, { id })
    .then((res) => res.data);
};
