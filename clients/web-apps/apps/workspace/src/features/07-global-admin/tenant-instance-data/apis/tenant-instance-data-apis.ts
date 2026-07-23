import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { appendAuthHeader } from "../../on-prem-tenant/utils/appendAuthHeader";
import { OnPremInstanceDataDto } from "../dtos/tenant-instance-dto";
import { OnpremTenantStaticDto } from "../dtos/tenant-statistics-dto";

const baseAPIURL: string = `${import.meta.env.VITE_GLOBALADMIN_API_URL}/onprem/instance-data`;

/**
 * Retrieves all TenantInstances Data
 */
const getTenantInstancesData = (id: string, startDate: string = "", endDate: string = "") => {
  return axiosInstance
    .get<IHttpResponse<OnPremInstanceDataDto[]>>(
      `${baseAPIURL}/${id}/list?startDate=${startDate}&endDate=${endDate}`,
      appendAuthHeader(),
    )
    .then((res) => res.data);
};

/**
 * Retrieve TenantInstance Data by ID
 */
const getTenantInstanceDataById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<OnPremInstanceDataDto>>(`${baseAPIURL}/${id}`, appendAuthHeader())
    .then((res) => res.data);
};

/**
 * Retrieve TenantInstance statistics by ID
 */
const getTenantInstanceStatistics = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<OnpremTenantStaticDto>>(
      `${import.meta.env.VITE_GLOBALADMIN_API_URL}/onprem/instance/${id}/statistics`,
      appendAuthHeader(),
    )
    .then((res) => res.data);
};

export { getTenantInstancesData, getTenantInstanceDataById, getTenantInstanceStatistics };
