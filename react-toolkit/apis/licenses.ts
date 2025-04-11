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
  if (!planId)
    return Promise.resolve<IHttpResponse<PricingPlanDto>>({
      statusCode: 201,
      message: "",
      data: {
        id: "",
        tenantId: "",
        name: "-",
        tenantType: "-",
        tenantName: "-",
        currency: "USD",
        unit: "",
        unitPrice: 0,
        frequency: "",
        cola: 0,
        isDisabled: false,
        createdBy: "",
        createdOn: new Date(),
        lastModifiedBy: "",
        lastModifiedOn: new Date(),
      },
    });
  return axiosInstance
    .get<IHttpResponse<PricingPlanDto>>(`${baseAPIURL}/${planId}`)
    .then((res) => res.data);
};
