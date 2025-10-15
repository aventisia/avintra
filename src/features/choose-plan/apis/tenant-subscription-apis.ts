import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { PaymentInfoDto } from "../dtos/payment-info-dto";
import { PurchasePlanDto } from "../dtos/purchase-plan-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/tenant-subscriptions`;

export const purchasePlan = (postObj: PurchasePlanDto) =>
  axiosInstance
    .post<IHttpResponse<PaymentInfoDto>>(`${baseAPIURL}/purchase-plan`, postObj)
    .then((res) => res.data);
