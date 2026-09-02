import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { JobDetailsDto } from "../dtos/jobs-details-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/job`;

/**
 * Inserts a new job.
 */
export const insertJob = (newJob: JobDetailsDto) => {
  return axiosInstance
    .post<IHttpResponse<JobDetailsDto>>(`${baseAPIURL}`, newJob, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

export const updateJobData = (data: JobDetailsDto) => {
  return axiosInstance
    .put<IHttpResponse<JobDetailsDto>>(`${baseAPIURL}`, data, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Aborts a running job, transitioning it to Aborted and notifying the executing machine.
 */
export const abortJobExecution = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<JobDetailsDto>>(
      `${baseAPIURL}/abort`,
      { id },
      {
        headers: getStudioSpaceHeaders(),
      },
    )
    .then((res) => res.data);
};
