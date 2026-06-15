import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { ExecuteFlowRequestDto } from "../dtos/execute-flow-request-dto";
import { ExecuteFlowResponseDto } from "../dtos/execute-flow-response-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/execute-flow`;

/**
 * Executes a flow on the web server by sending a POST request to the API with the flow version ID.
 * @param requestDto - The request DTO containing the flow version ID and input arguments in JSON format (optional)
 * @returns Promise with the API response containing job details
 */
export const executeFlowOnWeb = (requestDto: ExecuteFlowRequestDto) => {
  return axiosInstance
    .post<
      IHttpResponse<ExecuteFlowResponseDto>
    >(`${baseAPIURL}/execute`, requestDto)
    .then((res) => res.data);
};
