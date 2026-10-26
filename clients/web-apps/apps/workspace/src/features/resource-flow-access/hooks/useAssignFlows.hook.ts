import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getHttpErrorMessage } from "../../resource-user-access/utils/http-error.util";
import { assignFlows } from "../apis/resource-flow-access.apis";
import { RESOURCE_FLOW_KEY } from "../constants/resource-flow-access.constant";
import type { AssignResourceFlowsDto } from "../dtos/resource-flow-access.dto";

/**
 * Saves the complete flow assignment set for a resource and refreshes the affected lists.
 */
export const useAssignFlows = (queryKey: unknown[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignResourceFlowsDto: AssignResourceFlowsDto) =>
      assignFlows(assignResourceFlowsDto),

    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: [RESOURCE_FLOW_KEY] });
      await queryClient.invalidateQueries({ queryKey });
      if (!res?.message) return;
      const unassignedFlows = res.data?.unassignedPublishedFlows ?? [];
      if (unassignedFlows.length > 0) {
        toast.warning(
          `${res.message} Published agents not on the list will fail to republish: ${unassignedFlows.join(", ")}.`,
        );
      } else if (res.data) toast.success(res.message);
      else toast.info(res.message);
    },

    onError: (error: unknown) => {
      toast.error(getHttpErrorMessage(error));
    },
  });
};
