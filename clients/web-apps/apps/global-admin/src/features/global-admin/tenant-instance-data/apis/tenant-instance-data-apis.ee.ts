import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { appendAuthHeader } from "@/utils/appendAuthHeader.ee";

import { OnPremInstanceDataDto } from "../dtos/tenant-instance-dto.ee";
import { OnpremInstanceStaticDto } from "../dtos/tenant-statistics-dto.ee";

const baseAPIURL: string = `${import.meta.env.VITE_GLOBALADMIN_API_URL}/onprem/instance-data`;

/**
 * Retrieves all TenantInstances Data
 */
const getTenantInstancesData = (id: string, startDate: string = "", endDate: string = "") => {
  return axiosInstance
    .get<IHttpResponse<OnPremInstanceDataDto[]>>(`${baseAPIURL}/${id}/list`, {
      ...appendAuthHeader(),
      params: { startDate: startDate || undefined, endDate: endDate || undefined },
    })
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
    .get<IHttpResponse<OnpremInstanceStaticDto>>(
      `${import.meta.env.VITE_GLOBALADMIN_API_URL}/onprem/instance/${id}/statistics`,
      appendAuthHeader(),
    )
    .then((res) => res.data);
};

export { getTenantInstancesData, getTenantInstanceDataById, getTenantInstanceStatistics };
