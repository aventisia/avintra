import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { OnPremInstanceDataDto } from "../dtos/tenant-instance-dto";
import { OnpremTenantStaticDto } from "../dtos/tenant-statistics-dto";

const baseAPIURL: string = `${import.meta.env.VITE_GLOBAL_ADMIN_BASE_URL}/onprem/instance-data`;

/**
 * Retrieves all TenantInstances Data
 */
const getTenantInstancesData = (
  id: string,
  startDate: string = "",
  endDate: string = "",
) => {
  return axiosInstance
    .get<
      IHttpResponse<OnPremInstanceDataDto[]>
    >(`${baseAPIURL}/${id}/list?startDate=${startDate}&endDate=${endDate}`)
    .then((res) => res.data);
};

/**
 * Retrieve TenantInstance Data by ID
 */
const getTenantInstanceDataById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<OnPremInstanceDataDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Retrieve TenantInstance statistics by ID
 */
const getTenantInstanceStatistics = (id: string) => {
  return axiosInstance
    .get<
      IHttpResponse<OnpremTenantStaticDto>
    >(`${import.meta.env.VITE_GLOBAL_ADMIN_BASE_URL}/onprem/instance/${id}/statistics`)
    .then((res) => res.data);
};

export {
  getTenantInstancesData,
  getTenantInstanceDataById,
  getTenantInstanceStatistics,
};
