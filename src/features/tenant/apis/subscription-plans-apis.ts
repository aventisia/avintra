import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/subscription-plans`;

export const getSubscriptionPlans = () =>
  axiosInstance
    .get<IHttpResponse<SubscriptionPlanDTO[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
