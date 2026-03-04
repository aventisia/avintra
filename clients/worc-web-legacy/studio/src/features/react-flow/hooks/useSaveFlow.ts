import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { updateFlowSilently } from "../apis/react-flow-apis";

export const useSaveFlow = () => {
  // Get global store state & actions
  const { currentFlow, setIsFlowSaving } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setIsFlowSaving: state.setIsFlowSaving,
    })),
  );

  const queryClient = useQueryClient();

  // Get ReactFlowExt store state & actions
  const {
    nodes,
    edges,
    isSavePending,
    flowVariablesObject,
    inputOutputObject,
    isPublished,
    viewport,
    setSavedSnapshot,
  } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      flowVariablesObject: state.flowVariablesObject,
      inputOutputObject: state.inputOutputObject,
      isSavePending: state.isSavePending,
      isPublished: state.isPublished,
      viewport: state.viewport,
      setSavedSnapshot: state.setSavedSnapshot,
    })),
  );

  // Create a mutation to update flow silently
  const { mutate: updateFlow, isPending } = useMutation({
    mutationFn: updateFlowSilently,
    onSuccess: () => {
      // Capture the exact state that was persisted to the database

      setSavedSnapshot({
        nodes,
        edges,
        flowVariablesObject,
      });

      queryClient.invalidateQueries({
        queryKey: ["AGENT_HISTORY", currentFlow.versionId],
      });

      toast.success("Flow saved successfully", {
        className: "sonner-toaster-sm",
      });
    },
    onError: (error) => {
      toast.error(error.toString());
    },
    onSettled: () => {
      setIsFlowSaving(false);
    },
  });

  // Function to perform save logic
  const saveData = () => {
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
      viewport: viewport,
    };
    //set viewport state for react flow oject ext(only for reference its not for ReactFLow)
    // setViewport(viewportState);

    // Set isFlowSaving to true
    setIsFlowSaving(true);

    // Save flow silently
    updateFlow({
      id: currentFlow.id,
      reactFlowObject: JSON.stringify(reactFlowObject),
      flowVariablesObject: JSON.stringify(flowVariablesObject),
      inputOutputObject: JSON.stringify(inputOutputObject),
      versionId: currentFlow.versionId,
    });
  };

  return { saveData, isPending, isSavePending };
};
