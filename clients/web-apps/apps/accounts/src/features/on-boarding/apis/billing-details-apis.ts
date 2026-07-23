import type { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import type { BillingDetailsDto } from "../dtos/billing-details-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/billing-detail`;

export const getBillingDetails = () =>
  axiosInstance.get<IHttpResponse<BillingDetailsDto>>(`${baseAPIURL}`).then((res) => res.data);

export const insertBillingDetails = (postObj: BillingDetailsDto) =>
  axiosInstance
    .post<IHttpResponse<BillingDetailsDto>>(`${baseAPIURL}`, postObj)
    .then((res) => res.data);

export const updateBillingDetails = (postObj: BillingDetailsDto) =>
  axiosInstance
    .put<IHttpResponse<BillingDetailsDto>>(`${baseAPIURL}`, postObj)
    .then((res) => res.data);
