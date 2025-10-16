import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { BillingDetailsDto } from "../dtos/billing-details-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/billing-detail`;

export const getBillingDetails = () =>
  axiosInstance
    .get<IHttpResponse<BillingDetailsDto>>(`${baseAPIURL}`)
    .then((res) => res.data);

export const insertBillingDetails = (postObj: BillingDetailsDto) =>
  axiosInstance
    .post<IHttpResponse<BillingDetailsDto>>(`${baseAPIURL}`, postObj)
    .then((res) => res.data);

export const updateBillingDetails = (postObj: BillingDetailsDto) =>
  axiosInstance
    .put<IHttpResponse<BillingDetailsDto>>(`${baseAPIURL}`, postObj)
    .then((res) => res.data);
