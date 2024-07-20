import { PwdLoginDto } from "@/features/login";
import { axiosInstance } from "@/react-toolkit/apis";
import {
  CheckVerificationCodeDto,
  UserSessionDto,
  IHttpResponse,
} from "@/react-toolkit/dtos";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/auth`;

/** Authenticates individual or tenant's user via username and pwd */
const authenticateUser = (postObj: PwdLoginDto) => {
  // IMPORTANT NOTE: Not casting it to IHttpResponse<UserSessionDto> because we could get <IHttpResponse<CreatedVerificationCodeDto>> in case of TwoFA
  return axiosInstance
    .post(`${baseAPIURL}/login`, postObj)
    .then((res) => res.data);
};

/** Checks TwoFA verification code for provided username */
const checkTwoFAVerificationCode = (postObj: CheckVerificationCodeDto) => {
  return axiosInstance
    .post<
      IHttpResponse<UserSessionDto>
    >(`${baseAPIURL}/verify-2fa-code`, postObj)
    .then((res) => res.data);
};

export { authenticateUser, checkTwoFAVerificationCode };
