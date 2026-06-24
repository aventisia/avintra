import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { FetchSubFlowDto } from "../dtos/fetch-sub-flow-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow`;

export const fetchSubFlows = (subFlowIds: string[]) => {
  return axiosInstance
    .post<
      IHttpResponse<FetchSubFlowDto[]>
    >(`${baseAPIURL}/fetch-sub-flows`, subFlowIds)
    .then((res) => res.data);
};
