import { DEBOUNCE_SAVE_DELAY } from "@/constants";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useViewport } from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { updateFlowSilently } from "../apis/react-flow-apis";
import { FlowSilentUpdateDto } from "../dtos/flow-silent-update-dto";

export const useUpdateFlowSilently = () => {
  // Get viewport state
  const viewportState = useViewport();
  // const queryClient = useQueryClient();

  // Get global store state & actions
  const { currentFlow, setIsFlowSaving } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setIsFlowSaving: state.setIsFlowSaving,
    })),
  );

  // Get ReactFlowExt store state & actions
  const {
    nodes,
    edges,
    isSavePending,
    setIsSavePending,
    flowVariablesObject,
    inputOutputObject,
    isPublished,
    setViewport,
  } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      flowVariablesObject: state.flowVariablesObject,
      inputOutputObject: state.inputOutputObject,
      isSavePending: state.isSavePending,
      setIsSavePending: state.setIsSavePending,
      isPublished: state.isPublished,
      setViewport: state.setViewport,
    })),
  );

  // Create a mutation to update flow silently
  const { mutate: updateFlow } = useMutation({
    mutationFn: updateFlowSilently,
    onSuccess: () => {
      // queryClient.invalidateQueries({
      //   queryKey: ["flow", currentFlow.id, currentFlow.versionId],
      // });

      // Set isSavePending to false
      setIsSavePending(false);
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.toString());
    },
    onSettled: () => {
      // Set isFlowSaving to false
      setIsFlowSaving(false);
    },
  });

  // Function to perform save logic
  const saveData = useCallback(
    (flowData: FlowSilentUpdateDto) => {
      // Set isFlowSaving to true
      setIsFlowSaving(true);

      // Save flow silently
      updateFlow(flowData);
    },
    [setIsFlowSaving, updateFlow],
  );

  //
  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentFlow?.accessType === "View" && isSavePending) {
        toast.info("You are in View-only mode. Changes will not be saved.");
        return;
      }

      if (isPublished && isSavePending)
        toast.info("Changes will not be saved for published agent");

      // Check if save is pending
      if (!isSavePending || isPublished) return;

      // Create react flow object
      const reactFlowObject = {
        nodes: nodes,
        edges: edges,
        viewport: viewportState,
      };
      //set viewport state for react flow oject ext(only for reference its not for ReactFLow)
      setViewport(viewportState);
      // Save flow data
      saveData({
        id: currentFlow.id,
        reactFlowObject: JSON.stringify(reactFlowObject),
        flowVariablesObject: JSON.stringify(flowVariablesObject ?? []),
        inputOutputObject: JSON.stringify(inputOutputObject),
        versionId: currentFlow.versionId,
      });
    }, DEBOUNCE_SAVE_DELAY); // Debounce save operation

    // Cleanup function to clear timeout on unmount or state change
    return () => clearTimeout(handler);
  }, [
    isSavePending,
    saveData,
    currentFlow.id,
    nodes,
    edges,
    flowVariablesObject,
    viewportState,
    isPublished,
    currentFlow.versionId,
    inputOutputObject,
  ]);
};
