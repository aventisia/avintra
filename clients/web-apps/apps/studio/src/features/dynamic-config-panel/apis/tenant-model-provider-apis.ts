import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { TenantModelProviderDto } from "../dtos/tenant-model-provider-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/tenant-model-provider`;

/**
 * Retrieves all model provider configurations for the current tenant.
 * Used by the Agent Builder (studio) to restrict BYOK provider/model options
 * to those enabled in the Tenant Admin "Model Providers" section.
 */
export const getTenantModelProviders = () => {
  return axiosInstance
    .get<IHttpResponse<TenantModelProviderDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};
