import { PwdResetDto } from "@/features/reset-pwd";
import { axiosInstance } from "@/react-toolkit/apis";
import { IHttpResponse } from "@/react-toolkit/dtos";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/auth`;

/** Reset pwd if user has forgotten his/her password or setting first time pwd */
const resetPwd = (postObj: PwdResetDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/reset-pwd`, postObj)
    .then((res) => res.data);
};

export { resetPwd };
