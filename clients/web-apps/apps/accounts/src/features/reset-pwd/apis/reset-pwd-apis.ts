import type { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import type { PwdResetDto } from "../dtos/pwd-reset-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth`;

/** Reset pwd if user has forgotten his/her password or setting first time pwd */
const resetPwd = (postObj: PwdResetDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/reset-pwd`, postObj)
    .then((res) => res.data);
};

export { resetPwd };
