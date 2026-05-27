import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { ExecutionsTableDto } from "../dtos/execution-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-execution-log`;

/**
 * Retrieves list of Executions.
 */
export const getExecutions = () => {
  return axiosInstance
    .get<IHttpResponse<ExecutionsTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Inserts a new Execution.
 */
export const insertExecution = (newExecution: ExecutionsTableDto) => {
  return axiosInstance
    .post<
      IHttpResponse<ExecutionsTableDto>
    >(`${baseAPIURL}/create`, newExecution)
    .then((res) => res.data);
};
