import type { CheckAvailabilityDto } from "@avplatform/ui/dtos";
import type { TrueFalseResultDto } from "@avplatform/ui/dtos";
import type { IHttpResponse } from "@avplatform/ui/dtos";

import type { CheckVerificationCodeDto } from "@/react-toolkit/dtos/request/check-verification-code-dto";
import type { CreateVerificationCodeDto } from "@/react-toolkit/dtos/request/create-verification-code-dto";
import type { EmailDto } from "@/react-toolkit/dtos/request/email-dto";
import type { CreatedVerificationCodeDto } from "@/react-toolkit/dtos/response/created-verification-code-dto";
import type { TenantInfoDto } from "@/react-toolkit/dtos/response/tenant-info-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth`;

/** Checks the availability of a email. */
const isEmailAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-email-available`, postObj)
    .then((res) => res.data);
};

/** Creates verification code for provided username and request type */
const createVerificationCode = (postObj: CreateVerificationCodeDto) => {
  return axiosInstance
    .post<IHttpResponse<CreatedVerificationCodeDto>>(`${baseAPIURL}/create-code`, postObj)
    .then((res) => res.data);
};

/** Validates username and Gets tenant and its SSO config if SSO is enabled */
const getTenantInfo = (postObj: EmailDto) => {
  return axiosInstance
    .post<IHttpResponse<TenantInfoDto>>(`${baseAPIURL}/tenant-info`, postObj)
    .then((res) => res.data);
};

/** Checks verification code matches or not For "ResetPwd" & other request type */
const checkVerificationCode = (postObj: CheckVerificationCodeDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/verify-code`, postObj)
    .then((res) => res.data);
};

export { checkVerificationCode, createVerificationCode, getTenantInfo, isEmailAvailable };
