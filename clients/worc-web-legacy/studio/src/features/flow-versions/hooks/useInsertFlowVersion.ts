import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertFlowVersion } from "../apis/flow-version-apis";
import { DATA_QUERY_KEY } from "../constants";
import {
  getFlowToLoad,
  updateFlowSilently,
} from "@/features/react-flow/apis/react-flow-apis";
import { useOpenFlow } from "@/features/flows-popover/hooks/useOpenFlow";

export const useInsertFlowVersionMutation = ({
  flowId,
  versionId,
}: {
  flowId: string;
  versionId: string;
}) => {
  // Get query client
  const queryClient = useQueryClient();

  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  const { isPending, mutate } = useMutation({
    mutationFn: insertFlowVersion,
    onSuccess: async (httpResponse) => {
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });

      const flowData = await getFlowToLoad(flowId || "flowId", versionId);

      if (flowData?.data)
        updateFlowSilently({
          id: httpResponse.data.flowId,
          versionId: httpResponse.data.id,
          reactFlowObject: flowData?.data.reactFlowObject || "",
          inputOutputObject: flowData?.data.inputOutputObject,
          flowVariablesObject:
            flowData?.data.flowVariablesObject ?? JSON.stringify([]),
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
