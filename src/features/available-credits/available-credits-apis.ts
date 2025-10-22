import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { AvailableCreditDto } from "./available-credits-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/credit-usage`;

/** Get available credits for the user */
const getAvailableCredits = () => {
  return axiosInstance
    .get<IHttpResponse<AvailableCreditDto>>(`${baseAPIURL}/available-credits`)
    .then((res) => res.data);
};

export { getAvailableCredits };
