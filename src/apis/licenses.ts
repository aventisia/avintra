import { IHttpResponse } from "../../react-toolkit/dtos/http-response";
import { axiosInstance } from "../../react-toolkit/lib/axios-instance";
import { PricingPlanDto } from "../../react-toolkit/types/pricing-plan-dto";
import { ISelectOption } from "../../react-toolkit/types/select-option";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/plan`;

export const getLicensesToSelect = (tenantId?: string) => {
  tenantId = tenantId && !tenantId?.includes("00000000") ? tenantId : "";
  return axiosInstance
    .get<
      IHttpResponse<ISelectOption[]>
    >(`${baseAPIURL}/plans-to-select/${tenantId}`)
    .then((res) => res.data);
};

export const getCurrenciesToSelect = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/currencies-to-select`)
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
