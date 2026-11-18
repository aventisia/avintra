import type { IHttpResponse } from "@avplatform/ui/dtos";
import type { SocialCallbackDto } from "@avplatform/ui/dtos";
import type { SocialChallengeResendDto } from "@avplatform/ui/dtos";
import type { SocialLinkVerifyDto } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth`;

/** Confirms the one-time code that links a Google or GitHub account to an existing account */
const verifySocialLink = (postObj: SocialLinkVerifyDto) => {
  return axiosInstance
    .post<IHttpResponse<SocialCallbackDto>>(`${baseAPIURL}/social/link/verify`, postObj)
    .then((res) => res.data);
};

/** Resends the outstanding two-step or account-link code of a social sign-in attempt */
const resendSocialChallenge = (postObj: SocialChallengeResendDto) => {
  return axiosInstance
    .post<IHttpResponse<SocialCallbackDto>>(`${baseAPIURL}/social/challenge/resend`, postObj)
    .then((res) => res.data);
};

export { resendSocialChallenge, verifySocialLink };
