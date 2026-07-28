import { axiosInstance } from "@avplatform/ui/lib";

import { IHttpResponse } from "@avplatform/ui/dtos";

import { FetchSubFlowDto } from "../dtos/fetch-sub-flow-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow`;

export const fetchSubFlows = (subFlowIds: string[]) => {
  return axiosInstance
    .post<
      IHttpResponse<FetchSubFlowDto[]>
    >(`${baseAPIURL}/fetch-sub-flows`, subFlowIds)
    .then((res) => res.data);
};
