import { toast } from "@avplatform/ui/sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteTemplate } from "../apis/save-as-template-apis";

import { useSaveAsTemplateStore } from "../stores/save-as-template-store";

import { useShallow } from "zustand/react/shallow";
import { useFileStore } from "@/features/file-uploader-setup/stores/file-uploader-store";
import { useSearchParams } from "react-router-dom";

/**
 * useDeleteTemplateMutation
 *
 * Custom hook to handle the "Deleting Template" API mutation.
 * Manages side effects like closing the dialog and showing toast messages.
 */
export const useDeleteTemplateMutation = () => {
  // Get query client
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const versionId = searchParams.get("v") || "";

  // Extract dialog control action from the store
  const { setShowDialog } = useSaveAsTemplateStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  const { clearAll } = useFileStore(
    useShallow((state) => ({
      clearAll: state.clearAll,
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
        queryKey: ["PROJECT_TEMPLATE", versionId],
      });

      clearAll();
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
