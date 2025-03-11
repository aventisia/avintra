import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { IOptimisticMutation } from "@/react-toolkit/dtos/optimistic-mutation";
import { CheckAvailabilityDto } from "@/react-toolkit/dtos/request/check-availability-dto";
import { TrueFalseResultDto } from "@/react-toolkit/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { JobsTableDto } from "../dtos/jobs-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/job`;

/**
 * Retrieves list of Jobs.
 */
export const getJobs = () => {
  return axiosInstance
    .get<IHttpResponse<JobsTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a Job name.
 */
export const isNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new Job.
 */
export const insertJob = (newJob: JobsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<JobsTableDto>>(`${baseAPIURL}`, newJob)
    .then((res) => res.data);
};

/**
 * retry the failed job
 */
export const retryJob = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/${id}/retry`)
    .then((res) => res.data);
};

/**
 * cancel the running job
 */
export const cancelJob = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/${id}/cancel`)
    .then((res) => res.data);
};

/**
 * Updates an existing Job.
 */
export const updateJob = (updatedJob: JobsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<JobsTableDto>>(`${baseAPIURL}`, updatedJob)
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
 * Deletes multiple Jobs by their IDs.
 */
export const deleteJobs = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a Job based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<JobsTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const JobOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<JobsTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertJob(payload as JobsTableDto);
    case "update":
      return updateJob(payload as JobsTableDto);
    case "delete":
      return deleteJob(payload as string);
    case "delete-multiple":
      return deleteJobs(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};

