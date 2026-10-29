import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { CompanyDetailsDTO } from "../dtos/company-details-dto.ee";
import { CurrentPlanDto } from "../dtos/current-plan-dto.ee";
import { NotificationSettingsDto } from "../dtos/notification-settings-dto.ee";
import { PaymentMethodDTO } from "../dtos/payment-methods-dto.ee";
import { TenantPreferencesDto } from "../dtos/tenant-prefrences-dto.ee";
import { TenantSsoStateDto } from "../dtos/tenant-sso-state.dto.ee";
import { TenantPreferencesUpdatePayload } from "../types/tenant-preferences-update-payload.type.ee";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-account`;

const getCompanyDetails = () =>
  axiosInstance
    .get<IHttpResponse<CompanyDetailsDTO>>(`${baseAPIURL}/detail`)
    .then((res) => res.data);

const updateCompanyDetails = (postObj: CompanyDetailsDTO) =>
  axiosInstance
    .put<IHttpResponse<CompanyDetailsDTO>>(`${baseAPIURL}/detail`, postObj)
    .then((res) => res.data);

const getTenantPreferences = () =>
  axiosInstance
    .get<IHttpResponse<TenantPreferencesDto>>(`${baseAPIURL}/preferences`)
    .then((res) => res.data);

const updateTenantPreferences = (pref: TenantPreferencesUpdatePayload) =>
  axiosInstance
    .put<IHttpResponse<TenantPreferencesDto>>(`${baseAPIURL}/preferences`, pref)
    .then((res) => res.data);

/** Enables or disables single sign-on for the tenant. */
const updateTenantSsoState = (ssoState: TenantSsoStateDto) =>
  axiosInstance
    .put<IHttpResponse<TenantPreferencesDto>>(`${baseAPIURL}/sso/enabled`, ssoState)
    .then((res) => res.data);

const getSsoAdminConsentUrl = () =>
  axiosInstance
    .get<IHttpResponse<string>>(`${baseAPIURL}/sso/admin-consent-url`)
    .then((res) => res.data);

const getNotificationSettings = () =>
  axiosInstance
    .get<IHttpResponse<NotificationSettingsDto>>(`${baseAPIURL}/notification-settings`)
    .then((res) => res.data);

const updateNotificationSettings = (settingsDto: NotificationSettingsDto) =>
  axiosInstance
    .put<IHttpResponse<NotificationSettingsDto>>(`${baseAPIURL}/notification-settings`, settingsDto)
    .then((res) => res.data);

const getTenantCurrentPlan = () =>
  axiosInstance
    .get<IHttpResponse<CurrentPlanDto>>(
      `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-subscriptions/current-plan`,
    )
    .then((res) => res.data);

const getPaymentMethods = () =>
  axiosInstance
    .get<IHttpResponse<PaymentMethodDTO[]>>(
      `${import.meta.env.VITE_ACCOUNTS_API_PATH}/payment-methods/list`,
    )
    .then((res) => res.data);

const getAgentsCount = () =>
  axiosInstance
    .get<IHttpResponse<number>>(`${import.meta.env.VITE_WORKSPACE_API_PATH}/agent/total-published`)
    .then((res) => res.data);

export {
  getTenantCurrentPlan,
  getCompanyDetails,
  getTenantPreferences,
  updateTenantPreferences,
  updateTenantSsoState,
  getSsoAdminConsentUrl,
  getNotificationSettings,
  updateNotificationSettings,
  updateCompanyDetails,
  getPaymentMethods,
  getAgentsCount,
};
