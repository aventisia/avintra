import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@aventisia/ui/sonner";
import { updateFlowSilently } from "@/features/react-flow/apis/react-flow-apis";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useState } from "react";
import { useImportStore } from "../stores/import-flow-store";
import { useShallow } from "zustand/react/shallow";

/**
 * Custom hook to manage the flow update mutation.
 * Handles the mutation for updating the flow and manages loading states.
 */
export const useFlowMutation = (
  flowId: string,
  versionId: string | undefined,
) => {
  const [isImportPending, setImportPending] = useState(false);
  const queryClient = useQueryClient();

  // Import state management
  const { setShowDialog } = useImportStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      upload: state.upload,
      setShowDialog: state.setShowDialog,
    })),
  );
  // Fetch state setters from global stores
  const { setIsFlowSaving } = useCurrentFlowStore(
    useShallow((state) => ({
      setIsFlowSaving: state.setIsFlowSaving,
    })),
  );

  // Mutation for silently updating the flow without user intervention
  const { mutate: updateFlow } = useMutation({
    mutationFn: updateFlowSilently,
    onSuccess: () => {
      // Invalidate any queries related to the flow, ensuring they are refetched
      queryClient
        .invalidateQueries({
          queryKey: ["flow", flowId, versionId],
        })
        .finally(() => {
          setImportPending(false);
          setShowDialog(false);
        });
    },
    onError: (error) => {
      // Display an error toast if the mutation fails
      toast.error(error.toString());
      setImportPending(false);
      setShowDialog(false);
    },
    onSettled: () => {
      // Reset the flow saving state once the mutation is settled
      setIsFlowSaving(false);
    },
  });

  return { updateFlow, isImportPending, setImportPending };
};
