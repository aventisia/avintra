import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useOpenFlow } from "@/features/flows-popover/hooks/useOpenFlow";
import { getFlowToLoad, updateFlowSilently } from "@/features/react-flow/apis/react-flow-apis";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { insertFlowVersion } from "../apis/flow-version-apis";
import { DATA_QUERY_KEY } from "../constants";

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
  const setVersionTransition = useCurrentFlowStore(
    useShallow((state) => state.setVersionTransition),
  );

  const { isPending, mutate } = useMutation({
    mutationFn: insertFlowVersion,
    onMutate: () => setVersionTransition(undefined),
    onSuccess: async (httpResponse) => {
      queryClient.invalidateQueries({ queryKey: [...DATA_QUERY_KEY, flowId] });

      const flowData = await getFlowToLoad(flowId || "flowId", versionId);

      if (flowData?.data) {
        try {
          await updateFlowSilently({
            id: httpResponse.data.flowId,
            versionId: httpResponse.data.id,
            reactFlowObject: flowData.data.reactFlowObject || "",
            inputOutputObject: flowData.data.inputOutputObject,
            flowVariablesObject: flowData.data.flowVariablesObject ?? JSON.stringify([]),
          });
          setVersionTransition(httpResponse.data.id);
          // The discard confirm already happened in FVIDraftAction, so don't
          // prompt again while navigating to the newly created version.
          await handleOpenFlowAction(httpResponse.data.flowId, httpResponse.data.id, {
            skipUnsavedGuard: true,
          });
        } catch (error) {
          setVersionTransition(null);
          throw error;
        }
      } else {
        setVersionTransition(null);
      }

      // Success message
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
    },

    onError: (error) => {
      setVersionTransition(null);
      // Show error toast
      toast.error(error.toString());
    },
  });
  return {
    isPending,
    mutate,
  };
};
