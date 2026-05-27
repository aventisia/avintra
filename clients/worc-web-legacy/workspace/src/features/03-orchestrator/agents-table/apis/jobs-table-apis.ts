import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { JobTableDto } from "../dtos/jons-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/job`;

/**
 * Retrieves all jobs
 */
const getJobs = () => {
  return axiosInstance
    .get<IHttpResponse<JobTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Inserts a new job.
 */
const insertJob = (newJob: JobTableDto) => {
  return axiosInstance
    .post<IHttpResponse<JobTableDto>>(`${baseAPIURL}`, newJob)
    .then((res) => res.data);
};

export { getJobs, insertJob };
