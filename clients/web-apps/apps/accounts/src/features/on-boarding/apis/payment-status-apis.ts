import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import type { IHttpResponse } from "@aventisia/ui/dtos";

import type { PaymentStatusDto } from "../dtos/payment-status-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/payment-tracker`;

export const getPaymentStatus = (paymentId: string) =>
  axiosInstance
    .get<IHttpResponse<PaymentStatusDto>>(`${baseAPIURL}/${paymentId}`)
    .then((res) => res.data);
