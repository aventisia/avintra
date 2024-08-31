import { DEBOUNCE_SAVE_DELAY } from "@/constants";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { updateFlowSilently } from "../apis/react-flow-apis";
import { FlowSilentUpdateDto } from "../dtos/flow-silent-update-dto";

export const useUpdateFlowSilently = () => {
  // Get global store state & actions
  const { currentFlow, setIsFlowSaving } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setIsFlowSaving: state.setIsFlowSaving,
    })),
  );

  // Get ReactFlowExt store state & actions
  const { nodes, edges, isSavePending, setIsSavePending } =
    useReactFlowExtStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        isSavePending: state.isSavePending,
        setIsSavePending: state.setIsSavePending,
      })),
    );

  // Create a mutation to update flow silently
  const { mutate: updateFlow } = useMutation({
    mutationFn: updateFlowSilently,
    onSuccess: () => {
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
      // Check if save is pending
      if (!isSavePending) return;

      // Save flow data
      saveData({
        id: currentFlow.id,
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
      });
    }, DEBOUNCE_SAVE_DELAY); // Debounce save operation

    // Cleanup function to clear timeout on unmount or state change
    return () => clearTimeout(handler);
  }, [isSavePending, saveData, currentFlow.id, nodes, edges]);
};
