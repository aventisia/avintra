import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { AvailableCreditDto } from "./available-credits-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/credit-usage`;

/** Get available credits for the user */
const getAvailableCredits = () => {
  return axiosInstance
    .get<IHttpResponse<AvailableCreditDto>>(`${baseAPIURL}/available-credits`)
    .then((res) => res.data);
};

export { getAvailableCredits };
