import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { TenantEnabledModelDto } from "../dtos/tenant-enabled-model.dto";
import { ModelCapabilityEnum } from "../enums/model-capability-enum";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/tenant-model-provider`;

/**
 * Retrieves the tenant's enabled models, optionally filtered by model capability.
 */
export const getEnabledModels = (capability?: ModelCapabilityEnum) => {
  const params = new URLSearchParams();
  if (capability) params.set("capability", capability);
  const query = params.toString();
  return axiosInstance
    .get<IHttpResponse<TenantEnabledModelDto[]>>(
      `${baseAPIURL}/enabled-models${query ? `?${query}` : ""}`,
      { headers: getStudioSpaceHeaders() },
    )
    .then((res) => res.data);
};
