import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { PurchasePlanDto } from "../dtos/purchase-plan-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/tenant-subscriptions`;

export const purchasePlan = (postObj: PurchasePlanDto) =>
  axiosInstance
    .post<
      IHttpResponse<PurchasePlanDto>
    >(`${baseAPIURL}/purchase-plan`, postObj)
    .then((res) => res.data);
