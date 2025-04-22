import { TenantsTableDto } from "@/features/sa/tenants-table/dtos/tenants-table-dto";

import { IHttpResponse } from "../../react-toolkit/dtos/http-response";
import { axiosInstance } from "../../react-toolkit/lib/axios-instance";
import { ISelectOption } from "../../react-toolkit/types/select-option";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/tenant`;

export const getTenantsToSelect = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/tenants-to-select`)
    .then((res) => res.data);
};

export const searchTenantsToSelect = (query?: string) => {
  return axiosInstance
    .post<IHttpResponse<ISelectOption[]>>(
      `${baseAPIURL}/tenants-to-search-select`,
      {
        userInput: query ?? null,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => res.data);
};

export const getTenantDetails = (id?: string) => {
  if (!id)
    return Promise.resolve<IHttpResponse<TenantsTableDto>>({
      statusCode: 201,
      message: "",
      data: {
        name: "id not provided",
        effectiveDate: new Date(),
        renewalDate: new Date(),
      },
    });
  return axiosInstance
    .get<IHttpResponse<TenantsTableDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};
