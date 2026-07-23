import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { CreditTopUpDto } from "../dtos/credit-top-up-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/top-up`;

export const insertCreditTopUp = (postObj: CreditTopUpDto) =>
  axiosInstance
    .post<IHttpResponse<CreditTopUpDto>>(`${baseAPIURL}`, postObj)
    .then((res) => res.data);
