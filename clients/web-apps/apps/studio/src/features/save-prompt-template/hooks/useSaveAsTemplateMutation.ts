import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { postSaveAsTemplate } from "../apis/prompt-template-apis";
import { useSavePromptTemplateStore } from "../stores/save-prompt-template-store";

/**
 * useSaveAsTemplateMutation
 *
 * Custom hook to handle the "Save As Template" API mutation.
 * Manages side effects like closing the dialog and showing toast messages.
 */
export const useSaveAsTemplateMutation = () => {
  // Extract dialog control action from the store
  const { setShowDialog } = useSavePromptTemplateStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  // Define mutation using React Query
  const { isPending, mutate } = useMutation({
    // Function that triggers the API call
    mutationFn: postSaveAsTemplate,

    // Called on successful mutation
    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
      setShowDialog(false);
    },

    // Called on mutation error
    onError: (error) => {
      toast.error(error.toString());
    },

    // Always called at the end (success or error)
    onSettled: () => {
      // Close the dialog after submit attempt
    },
  });

  // Expose mutation and pending state
  return {
    isPending,
    mutate,
  };
};
