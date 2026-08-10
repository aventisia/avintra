import { IHttpResponse } from "@avplatform/ui/dtos";
import { IOptimisticMutation } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { JobInsertDto, JobRecordDto, JobUpdateDto, JobsTableRowDto } from "..";

const baseApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/job`;

/**
 * Retrieves a list of jobs based on optional start and end date filters.
 */
const getJobs = (startDate: string = "", endDate: string = "") => {
  return axiosInstance
    .get<IHttpResponse<JobsTableRowDto[]>>(
      `${baseApiUrl}/list?startDate=${startDate}&endDate=${endDate}`,
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Get job by its ID.
 */
const getJob = (jobID?: string) => {
  return axiosInstance
    .get<IHttpResponse<JobRecordDto>>(`${baseApiUrl}/${jobID}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Inserts a new job.
 *
 * NOTE: From frontend CRUD dialog, We should only use this method to create job for
 * published flow version since the execution location is decided by the
 * backend based on the user's desktop app for unpublished flow version.
 * Also, since all jobs which are created manually, will have the mannual
 * trigger type set by default so createdByName and CreatedById will be set
 * automatically by the backend based on the logged in user.
 */
const insertJob = (jobInsertDto: JobInsertDto) => {
  return axiosInstance
    .post<IHttpResponse<JobsTableRowDto>>(`${baseApiUrl}`, jobInsertDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing job.
 */
const updateJob = (jobUpdateDto: JobUpdateDto) => {
  return axiosInstance
    .put<IHttpResponse<JobsTableRowDto>>(`${baseApiUrl}`, jobUpdateDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes a Job by its ID.
 */
const deleteJob = (jobID: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseApiUrl}/${jobID}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Deletes multiple Jobs by their IDs.
 */
const deleteJobs = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseApiUrl}/delete-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Performs optimistic mutations for jobs table CRUD actions.
 */
const jobOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<JobInsertDto | JobUpdateDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertJob(payload as JobInsertDto);
    case "update":
      return updateJob(payload as JobUpdateDto);
    case "delete":
      return deleteJob(payload as string);
    case "delete-multiple":
      return deleteJobs(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

export { getJobs, getJob, insertJob, updateJob, deleteJob, deleteJobs, jobOptimisticMutationFn };
