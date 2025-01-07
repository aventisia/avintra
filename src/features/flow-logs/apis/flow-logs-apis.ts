import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { FlowLogsDTO } from "../dtos/flow-logs-dtos";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/Flow-log`;

/**
 * Retrieves list of flow logs.
 */
const getFlowLogs = async (id: string) => {
  const res = await axiosInstance.get<IHttpResponse<FlowLogsDTO[]>>(
    `${baseAPIURL}/list/${id}`,
  );
  return res.data;
};

/**
 * Inserts a new flow log.
 */
const insertFlowLog = async (newFlowLog: FlowLogsDTO) => {
  const res = await axiosInstance.post<IHttpResponse<FlowLogsDTO>>(
    `${baseAPIURL}`,
    newFlowLog,
  );
  return res.data;
};

export { getFlowLogs, insertFlowLog };
