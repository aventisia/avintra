import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { BillingHistoryDTO } from "../dtos/billing-history-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/billing-detail`;

/**
 * Retrieves all Billing history of a user
 */
const getBillingHistory = () => {
  return axiosInstance
    .get<IHttpResponse<BillingHistoryDTO[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

export { getBillingHistory };
