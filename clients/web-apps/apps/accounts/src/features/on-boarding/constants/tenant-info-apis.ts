import type { IHttpResponse } from "@avplatform/ui/dtos";
import type { UserSessionDto } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import type { TenantInfoDto } from "../dtos/tenant-info-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth`;

/** Update Tenant information*/
const updateTenantInfo = (postObj: TenantInfoDto) => {
  return axiosInstance
    .put<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/tenant-info`, postObj)
    .then((res) => res.data);
};

export { updateTenantInfo };
