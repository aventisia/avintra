import { toast } from "@aventisia/ui/sonner";

import { useMutation } from "@tanstack/react-query";

import { postSaveAsTemplate } from "../apis/save-as-template-apis";

import { useSaveAsTemplateStore } from "../stores/save-as-template-store";

import { useShallow } from "zustand/react/shallow";

/**
 * useSaveAsTemplateMutation
 *
 * Custom hook to handle the "Save As Template" API mutation.
 * Manages side effects like closing the dialog and showing toast messages.
 */
export const useSaveAsTemplateMutation = () => {
  // Extract dialog control action from the store
  const { setShowDialog } = useSaveAsTemplateStore(
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
    },

    // Called on mutation error
    onError: (error) => {
      toast.error(error.toString());
    },

    // Always called at the end (success or error)
    onSettled: () => {
      setShowDialog(false); // Close the dialog after submit attempt
    },
  });

  // Expose mutation and pending state
  return {
    isPending,
    mutate,
  };
};
