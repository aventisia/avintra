import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { deleteTemplate } from "../apis/prompt-template-apis";
import { useSavePromptTemplateStore } from "../stores/save-prompt-template-store";

/**
 * useDeleteTemplateMutation
 *
 * Custom hook to handle the "Deleting Template" API mutation.
 * Manages side effects like closing the dialog and showing toast messages.
 */
export const useDeleteTemplateMutation = () => {
  // Get query client
  const queryClient = useQueryClient();

  // Extract dialog control action from the store
  const { setShowDialog } = useSavePromptTemplateStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  // Define mutation using React Query
  const { isPending, mutate } = useMutation({
    // Function that triggers the API call
    mutationFn: deleteTemplate,

    // Called on successful mutation
    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
      queryClient.invalidateQueries({
        queryKey: ["PROMPT_TEMPLATES"],
      });

      setShowDialog(false);
    },

    // Called on mutation error
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Expose mutation and pending state
  return {
    isPending,
    mutate,
  };
};
