import type { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import type { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/subscription-plans`;

export const getSubscriptionPlans = (query?: string) =>
  axiosInstance
    .get<IHttpResponse<SubscriptionPlanDTO[]>>(
      query ? `${baseAPIURL}/all${query}` : `${baseAPIURL}/list`,
    )
    .then((res) => res.data);
