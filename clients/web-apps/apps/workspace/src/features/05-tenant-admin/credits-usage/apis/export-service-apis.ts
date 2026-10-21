import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { AgentModelDTO } from "../dtos/agents-models-dto";
import { ExportChartDTO } from "../dtos/export-chart-dto";

const workspaceUserApiUrl: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-account`;
const accountAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/credit-usage`;

const getSearchAgent = (value?: string) => {
  return axiosInstance
    .get<IHttpResponse<AgentModelDTO[]>>(`${workspaceUserApiUrl}/agent/search/${value}`)
    .then((res) => res.data);
};

const exportCreditUsageCSV = (postObj: ExportChartDTO) => {
  return axiosInstance
    .post(`${accountAPIURL}/export`, postObj, {
      responseType: "blob",
    })
    .then((res) => res.data); // just return the blob
};

export { getSearchAgent, exportCreditUsageCSV };
