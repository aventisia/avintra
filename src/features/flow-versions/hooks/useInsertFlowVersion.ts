import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertFlowVersion } from "../apis/flow-version-apis";
import { DATA_QUERY_KEY } from "../constants";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { updateFlowSilently } from "@/features/react-flow/apis/react-flow-apis";
import { LoadFlowDto } from "@/features/react-flow/dtos/load-flow-dto";
import { useOpenFlow } from "@/features/flows-popover/hooks/useOpenFlow";

export const useInsertFlowVersionMutation = () => {
  // Get query client
  const queryClient = useQueryClient();
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const flowId = queryParams.get("f");
  const versionId = queryParams.get("v") || undefined;

  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  // Get tenants data from query client
  const flowsData = queryClient.getQueryData<{
    data: LoadFlowDto;
  }>(["flow", flowId, versionId]);

  const { isPending, mutate } = useMutation({
    mutationFn: insertFlowVersion,
    onSuccess: (httpResponse) => {
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
      if (flowsData?.data)
        updateFlowSilently({
          id: httpResponse.data.flowId,
          versionId: httpResponse.data.id,
          reactFlowObject: flowsData?.data.reactFlowObject,
          inputOutputObject: flowsData?.data.inputOutputObject,
          flowVariablesObject: flowsData.data.flowVariablesObject,
        }).then(() => {
          handleOpenFlowAction(httpResponse.data.flowId, httpResponse.data.id);
        });
      // Success message
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
    },

    onError: (error) => {
      // Show error toast
      toast.error(error.toString());
    },
  });
  return {
    isPending,
    mutate,
  };
};
