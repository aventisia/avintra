import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { toast } from "@aventisia/ui/sonner";

import { FlowExecutionLogsDTO } from "../dtos/flow-execution-log-dto";

// Base URL for the flow execution log API
const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/execution-log`;

/**
 * Fetches the execution log of a specific flow based on the provided flow ID
 * @param id Flow Id
 * @returns Flow execution log data, or null if the request fails
 */
const getFlowExecutionLog = async (id: string) => {
  try {
    const res = await axiosInstance.get<IHttpResponse<FlowExecutionLogsDTO[]>>(
      `${baseAPIURL}/list/${id}`,
    );
    return res.data;
  } catch {
    // Show error toast if the request fails
    toast.error("Unable to load agent execution logs. Please try again.");
    return null;
  }
};

/**
 * Posts a new flow execution log entry to the server
 * @param postObj The log entry data to be posted
 * @returns True if the log entry was successfully created, else false
 */
const postFlowExecutionLog = async (postObj: FlowExecutionLogsDTO) => {
  const res = await axiosInstance.post<IHttpResponse<boolean>>(
    `${baseAPIURL}/create`,
    postObj,
  );
  return res.data;
};

export { getFlowExecutionLog, postFlowExecutionLog };
