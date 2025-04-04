import { IHttpResponse } from "../dtos/http-response";
import { axiosInstance } from "../lib/axios-instance";
import { PricingPlanDto } from "../types/pricing-plan-dto";
import { ISelectOption } from "../types/select-option";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/plan`;

export const getLicensesToSelect = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/plans-to-select`)
    .then((res) => res.data);
};

export const getLicenseDetails = (planId?: string) => {
  return axiosInstance
    .get<IHttpResponse<PricingPlanDto>>(`${baseAPIURL}/${planId}`)
    .then((res) => res.data);
};
