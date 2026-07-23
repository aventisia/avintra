import type { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import type { PaymentStatusDto } from "../dtos/payment-status-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/payment-tracker`;

export const getPaymentStatus = (paymentId: string) =>
  axiosInstance
    .get<IHttpResponse<PaymentStatusDto>>(`${baseAPIURL}/${paymentId}`)
    .then((res) => res.data);
