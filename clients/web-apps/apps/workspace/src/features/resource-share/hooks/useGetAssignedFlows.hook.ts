import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useEnvironmentStore } from "@/stores/environment-store";

import { getAssignedFlows } from "../apis/resource-flow-access.apis";
import { RESOURCE_FLOW_KEY } from "../constants/resource-flow-access.constant";
import { ResourceTypeEnum } from "../enums/resource-type-enum";
import { getHttpErrorMessage } from "../utils/http-error.util";

/**
 * Retrieves the flows currently assigned to a resource.
 */
export const useGetAssignedFlows = (resourceType: ResourceTypeEnum | null, resourceId: string) => {
  const env = useEnvironmentStore((state) => state.env);

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [RESOURCE_FLOW_KEY, resourceType, resourceId, env],
    queryFn: () => getAssignedFlows(resourceType as ResourceTypeEnum, resourceId),
    enabled: !!resourceType && !!resourceId,
  });

  useEffect(() => {
    if (isError) toast.error(getHttpErrorMessage(error));
  }, [error, isError]);

  return { data, isFetching, isLoading };
};
