import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import type { IHttpResponse } from "@aventisia/ui/dtos";

import type { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/subscription-plans`;

export const getSubscriptionPlans = (query?: string) =>
  axiosInstance
    .get<
      IHttpResponse<SubscriptionPlanDTO[]>
    >(query ? `${baseAPIURL}/all${query}` : `${baseAPIURL}/list`)
    .then((res) => res.data);
