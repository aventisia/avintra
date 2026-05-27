import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { CompanyDetailsDTO } from "../dtos/company-details-dto";
import { CurrentPlanDto } from "../dtos/current-plan-dto";
import { PaymentMethodDTO } from "../dtos/payment-methods-dto";
import { TenantPreferencesDto } from "../dtos/tenant-prefrences-dto";

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

const updateTenantPreferences = (pref: TenantPreferencesDto) =>
  axiosInstance
    .put<IHttpResponse<TenantPreferencesDto>>(`${baseAPIURL}/preferences`, pref)
    .then((res) => res.data);

const getTenantCurrentPlan = () =>
  axiosInstance
    .get<
      IHttpResponse<CurrentPlanDto>
    >(`${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-subscriptions/current-plan`)
    .then((res) => res.data);

const getPaymentMethods = () =>
  axiosInstance
    .get<
      IHttpResponse<PaymentMethodDTO[]>
    >(`${import.meta.env.VITE_ACCOUNTS_API_PATH}/payment-methods/list`)
    .then((res) => res.data);

const getAgentsCount = () =>
  axiosInstance
    .get<
      IHttpResponse<number>
    >(`${import.meta.env.VITE_WORKSPACE_API_PATH}/agent/total-published`)
    .then((res) => res.data);

export {
  getTenantCurrentPlan,
  getCompanyDetails,
  getTenantPreferences,
  updateTenantPreferences,
  updateCompanyDetails,
  getPaymentMethods,
  getAgentsCount,
};
