import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import type { IHttpResponse } from "@aventisia/ui/dtos";

import type { PaymentInfoDto } from "../dtos/payment-info-dto";
import type { PurchasePlanDto } from "../dtos/purchase-plan-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-subscriptions`;

export const purchasePlan = (postObj: PurchasePlanDto) =>
  axiosInstance
    .post<IHttpResponse<PaymentInfoDto>>(`${baseAPIURL}/purchase-plan`, postObj)
    .then((res) => res.data);
