import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { PaymentInfoDto } from "../dtos/payment-info-dto";
import { PurchasePlanDto } from "../dtos/purchase-plan-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-subscriptions`;

export const upgradePlan = (postObj: PurchasePlanDto) =>
  axiosInstance
    .put<IHttpResponse<PaymentInfoDto>>(`${baseAPIURL}/upgrade-plan`, postObj)
    .then((res) => res.data);
