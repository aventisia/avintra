<<<<<<<< Updated upstream:clients/web-apps/packages/ui/src/apis/accounts-auth-apis.ts
import type { CheckAvailabilityDto } from "@/ui/dtos";
import type { IHttpResponse } from "@/ui/dtos";
import type { CheckVerificationCodeDto } from "@/ui/dtos/request/check-verification-code-dto";
import type { CreateVerificationCodeDto } from "@/ui/dtos/request/create-verification-code-dto";
import type { EmailDto } from "@/ui/dtos/request/email-dto";
import type { CreatedVerificationCodeDto } from "@/ui/dtos/response/created-verification-code-dto";
import type { TenantInfoDto } from "@/ui/dtos/response/tenant-info-dto";
import type { TrueFalseResultDto } from "@/ui/dtos/response/true-false-result-dto";
import { axiosInstance } from "@/ui/lib/axios-instance";
========
import { CheckAvailabilityDto } from "@avplatform/ui/dtos";
import { TrueFalseResultDto } from "@avplatform/ui/dtos";
import { IHttpResponse } from "@avplatform/ui/dtos";
import { CheckVerificationCodeDto } from "@avplatform/ui/dtos/request/check-verification-code-dto";
import { CreateVerificationCodeDto } from "@avplatform/ui/dtos/request/create-verification-code-dto";
import { EmailDto } from "@avplatform/ui/dtos/request/email-dto";
import { CreatedVerificationCodeDto } from "@avplatform/ui/dtos/response/created-verification-code-dto";
import { TenantInfoDto } from "@avplatform/ui/dtos/response/tenant-info-dto";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
>>>>>>>> Stashed changes:clients/web-apps/apps/workspace/react-toolkit/apis/accounts-auth-apis.ts

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
