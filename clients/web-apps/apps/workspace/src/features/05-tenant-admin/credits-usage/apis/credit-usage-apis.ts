import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { AvailableCreditDto } from "../dtos/available-credits-dto";
import { CreditUsageDTO } from "../dtos/credits-usage-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/credit-usage`;

const getCreditUsageSummary = (startDate: string = "", endDate: string = "") =>
  axiosInstance
    .get<IHttpResponse<CreditUsageDTO>>(
      `${baseAPIURL}/summary?startDate=${startDate}&endDate=${endDate}`,
    )
    .then((res) => res.data);

/** Get available credits for the user */
const getAvailableCredits = () => {
  return axiosInstance
    .get<IHttpResponse<AvailableCreditDto>>(`${baseAPIURL}/available-credits`)
    .then((res) => res.data);
};

export { getCreditUsageSummary, getAvailableCredits };
