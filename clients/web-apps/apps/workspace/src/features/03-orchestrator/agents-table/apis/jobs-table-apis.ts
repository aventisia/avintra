import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { JobTableDto } from "../dtos/jons-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/job`;

/**
 * Retrieves all jobs
 */
const getJobs = () => {
  return axiosInstance
    .get<IHttpResponse<JobTableDto[]>>(`${baseAPIURL}/list`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Inserts a new job.
 */
const insertJob = (newJob: JobTableDto) => {
  return axiosInstance
    .post<IHttpResponse<JobTableDto>>(`${baseAPIURL}`, newJob, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

export { getJobs, insertJob };
