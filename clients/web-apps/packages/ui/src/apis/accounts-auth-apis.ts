import type { CheckAvailabilityDto } from "@/ui/dtos";
import type { IHttpResponse } from "@/ui/dtos";
import type { CheckVerificationCodeDto } from "@/ui/dtos/request/check-verification-code-dto";
import type { CreateVerificationCodeDto } from "@/ui/dtos/request/create-verification-code-dto";
import type { EmailDto } from "@/ui/dtos/request/email-dto";
import type { CreatedVerificationCodeDto } from "@/ui/dtos/response/created-verification-code-dto";
import type { SsoDiscoverDto } from "@/ui/dtos/response/sso-discover-dto";
import type { TenantInfoDto } from "@/ui/dtos/response/tenant-info-dto";
import type { TrueFalseResultDto } from "@/ui/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/ui/lib/axios-instance";

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

/** Resolves the single sign-on tenant for an email address (home realm discovery) */
const discoverTenant = (postObj: EmailDto) => {
  return axiosInstance
    .post<IHttpResponse<SsoDiscoverDto>>(`${baseAPIURL}/discover`, postObj)
    .then((res) => res.data);
};

/** Checks verification code matches or not For "ResetPwd" & other request type */
const checkVerificationCode = (postObj: CheckVerificationCodeDto) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/verify-code`, postObj)
    .then((res) => res.data);
};

export {
  checkVerificationCode,
  createVerificationCode,
  discoverTenant,
  getTenantInfo,
  isEmailAvailable,
};
