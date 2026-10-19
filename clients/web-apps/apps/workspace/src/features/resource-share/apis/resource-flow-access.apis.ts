import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders } from "@/utils/space-headers";

import {
  AssignResourceFlowsDto,
  AssignResourceFlowsResultDto,
  ResourceAssignedFlowDto,
} from "../dtos/resource-flow-access.dto";
import { ResourceTypeEnum } from "../enums/resource-type-enum";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/resource-flows`;

/**
 * Assigns the given flows to a resource, replacing the existing assignment set.
 */
const assignFlows = (assignResourceFlowsDto: AssignResourceFlowsDto) => {
  return axiosInstance
    .post<IHttpResponse<AssignResourceFlowsResultDto | null>>(
      `${baseAPIURL}/assign`,
      assignResourceFlowsDto,
      {
        headers: getConfigHeaders(),
      },
    )
    .then((res) => res.data);
};

/**
 * Retrieves the flows currently assigned to a resource.
 */
const getAssignedFlows = (resourceType: ResourceTypeEnum, resourceId: string) => {
  return axiosInstance
    .get<IHttpResponse<ResourceAssignedFlowDto[]>>(
      `${baseAPIURL}/${resourceType}/${resourceId}/assigned-flows`,
      {
        headers: getConfigHeaders(),
      },
    )
    .then((res) => res.data);
};

export { assignFlows, getAssignedFlows };
