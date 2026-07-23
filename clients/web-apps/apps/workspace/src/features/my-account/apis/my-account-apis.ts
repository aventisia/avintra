import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import type { ActiveSessionDto } from "../dtos/active-session-dto";
import type { DeactivateUserAccountDto } from "../dtos/deactivate-user-account-dto";
import type { DeactivationStatusDto } from "../dtos/deactivation-status-user-account-dto";
import type { EmailUpdateDto } from "../dtos/email-update-dto";
import type { UserBillingAddressDto } from "../dtos/my-account-company-dto";
import type { MyAccountPasswordDto } from "../dtos/my-account-password-dto";
import type { MyAccountDto } from "../dtos/my-account-profile-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/me`;

export const getMyProfileInfo = () =>
  axiosInstance.get<IHttpResponse<MyAccountDto>>(`${baseAPIURL}/profile`).then((res) => res.data);

export const isAccountDeactivated = () =>
  axiosInstance
    .get<IHttpResponse<boolean>>(`${baseAPIURL}/is-account-deactivated`)
    .then((res) => res.data);

export const updateMyProfileInfo = (myAccountDto: MyAccountDto) =>
  axiosInstance
    .put<IHttpResponse<MyAccountDto>>(`${baseAPIURL}/update-profile`, myAccountDto)
    .then((res) => res.data);

export const updateBillingAddress = (companyDto: UserBillingAddressDto) =>
  axiosInstance
    .put<IHttpResponse<UserBillingAddressDto>>(`${baseAPIURL}/update-billing-address`, companyDto)
    .then((res) => res.data);

export const getBillingAddress = () =>
  axiosInstance
    .get<IHttpResponse<UserBillingAddressDto>>(`${baseAPIURL}/billing-address`)
    .then((res) => res.data);

export const updateMyAccountPassword = (myAccountPasswordDto: MyAccountPasswordDto) =>
  axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/update-pwd`, myAccountPasswordDto)
    .then((res) => res.data);

export const updateMyAccountEmail = (emailUpdateDto: EmailUpdateDto) =>
  axiosInstance
    .post<IHttpResponse<EmailUpdateDto>>(`${baseAPIURL}/update-email`, emailUpdateDto)
    .then((res) => res.data);

export const getActiveSessions = () =>
  axiosInstance
    .get<IHttpResponse<ActiveSessionDto[]>>(`${baseAPIURL}/active-sessions`)
    .then((res) => res.data);

export const postTerminateSessions = (postObj: string[]) =>
  axiosInstance
    .post<IHttpResponse<string[]>>(`${baseAPIURL}/terminate-sessions`, {
      howSessionEnded: "SessionHasExpired",
      sessionIdList: postObj,
    })
    .then((res) => res.data);

export const deactivateMyAccount = (deactivateUserAccountDto: DeactivateUserAccountDto) =>
  axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/deactivate`, deactivateUserAccountDto)
    .then((res) => res.data);

export const getDeactivationStatus = () =>
  axiosInstance
    .get<IHttpResponse<DeactivationStatusDto>>(`${baseAPIURL}/deactivation-status`)
    .then((res) => res.data);
