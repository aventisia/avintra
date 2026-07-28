import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { JobCloseDto } from "../dtos/job-close-dto";
import { JobDetailsDto } from "../dtos/job-details-dto";
import { JobStartDto } from "../dtos/job-start-dto";
import { JobRecordDto } from "@/features/03-orchestrator/jobs-table/dtos/job-record-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/job`;

/**
 * Retrieves Job data.
 */
export const getJobById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<JobDetailsDto>>(`${baseAPIURL}/detail/${id}`)
    .then((res) => res.data);
};

/**
 * Starts a job, transitioning it from Created to Running.
 */
export const startJob = (data: JobStartDto) => {
  return axiosInstance
    .post<IHttpResponse<JobRecordDto>>(`${baseAPIURL}/start`, data)
    .then((res) => res.data);
};

/**
 * Closes a job in a terminal status. The backend records the end time,
 * node execution logs, and consumed credits automatically.
 */
export const closeJob = (data: JobCloseDto) => {
  return axiosInstance
    .post<IHttpResponse<JobRecordDto>>(`${baseAPIURL}/close`, data)
    .then((res) => res.data);
};

/**
 * Updates an existing job. Prefer startJob/closeJob for lifecycle transitions.
 */
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
