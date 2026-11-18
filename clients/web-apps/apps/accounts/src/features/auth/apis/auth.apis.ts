import type { CheckVerificationCodeDto, IHttpResponse, UserSessionDto } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import type { CreateAccountDto } from "../dtos/create-account.dto";
import type { PwdLoginDto } from "../dtos/pwd-login.dto";
import type { PwdResetDto } from "../dtos/pwd-reset.dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth`;

/** Authenticates an individual or tenant user with email and password */
const authenticateUser = (postObj: PwdLoginDto) => {
  // IMPORTANT NOTE: Not casting it to IHttpResponse<UserSessionDto> because we could get <IHttpResponse<CreatedVerificationCodeDto>> in case of TwoFA
  return axiosInstance.post(`${baseAPIURL}/login`, postObj).then((res) => res.data);
};

/** Checks the TwoFA verification code for the provided username */
const checkTwoFAVerificationCode = (postObj: CheckVerificationCodeDto) => {
  return axiosInstance
    .post<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/verify-2fa-code`, postObj)
    .then((res) => res.data);
};

/** Creates an individual user (IU) account once its email is verified */
const createAccount = (postObj: CreateAccountDto) => {
  return axiosInstance
    .post<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/create-user-account`, postObj)
    .then((res) => res.data);
};

/** Sets a new password after a verified reset code */
const resetPwd = (postObj: PwdResetDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/reset-pwd`, postObj)
    .then((res) => res.data);
};

export { authenticateUser, checkTwoFAVerificationCode, createAccount, resetPwd };
