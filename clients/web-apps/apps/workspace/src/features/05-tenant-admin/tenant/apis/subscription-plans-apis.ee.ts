import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto.ee";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/subscription-plans`;

export const getSubscriptionPlans = (query?: string) =>
  axiosInstance
    .get<IHttpResponse<SubscriptionPlanDTO[]>>(
      query ? `${baseAPIURL}/all${query}` : `${baseAPIURL}/list`,
    )
    .then((res) => res.data);
