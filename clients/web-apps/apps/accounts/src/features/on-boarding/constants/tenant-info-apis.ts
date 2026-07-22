import type { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import type { UserSessionDto } from "@/react-toolkit/dtos/response/user-session-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import type { TenantInfoDto } from "../dtos/tenant-info-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth`;

/** Update Tenant information*/
const updateTenantInfo = (postObj: TenantInfoDto) => {
  return axiosInstance
    .put<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/tenant-info`, postObj)
    .then((res) => res.data);
};

export { updateTenantInfo };
