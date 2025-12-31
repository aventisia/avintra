import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { AgentModelDTO } from "../dtos/agents-models-dto";
import { ExportChartDTO } from "../dtos/export-chart-dto";
import { WorkspaceUserDto } from "../dtos/workspace-user-dto";

const workspaceUserApiUrl: string = `${import.meta.env.VITE_WORC_API_URL}`;
const mlModelBuilderAPIUrl: string = `${import.meta.env.VITE_AISTUDIO_API_URL}`;
const accountAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/credit-usage`;

/**
 * Retrieves all flows users of a flow.
 */
const getSearchUser = (value?: string) => {
  return axiosInstance
    .get<
      IHttpResponse<WorkspaceUserDto[]>
    >(`${workspaceUserApiUrl}/user/search/${value}`)
    .then((res) => res.data);
};

const getSearchAgent = (value?: string) => {
  return axiosInstance
    .get<
      IHttpResponse<AgentModelDTO[]>
    >(`${workspaceUserApiUrl}/agent/search/${value}`)
    .then((res) => res.data);
};

const getSearchModel = (value?: string) => {
  return axiosInstance
    .get<
      IHttpResponse<AgentModelDTO[]>
    >(`${mlModelBuilderAPIUrl}/ai-models/list/${value}`)
    .then((res) => res.data);
};

const exportCreditUsageCSV = (postObj: ExportChartDTO) => {
  return axiosInstance
    .post(`${accountAPIURL}/export`, postObj, {
      responseType: "blob",
    })
    .then((res) => res.data); // just return the blob
};

export { getSearchUser, getSearchAgent, getSearchModel, exportCreditUsageCSV };
