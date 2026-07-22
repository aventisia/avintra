import type { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import type { PwdResetDto } from "../dtos/pwd-reset-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth`;

/** Reset pwd if user has forgotten his/her password or setting first time pwd */
const resetPwd = (postObj: PwdResetDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/reset-pwd`, postObj)
    .then((res) => res.data);
};

export { resetPwd };
