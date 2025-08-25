import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { CreditUsageDTO } from "../dtos/credits-usage-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/credit-usage`;

export const getCreditUsageSummary = (startDate : string="", endDate : string="") =>
  axiosInstance
    .get<IHttpResponse<CreditUsageDTO>>(`${baseAPIURL}/summary?startDate=${startDate}&endDate=${endDate}`)
    .then((res) => res.data);