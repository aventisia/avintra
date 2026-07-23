import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { putTenantPendingTemplates } from "../apis/templates-approval-apis";
import { PTA_QUERY_KEY, TTA_QUERY_KEY } from "../constants";
import { useTemplateApprovalStore } from "../stores/template-approval-store";

/**
 * useSaveAsTemplateMutation
 *
 * Custom hook to handle the "Save As Template" API mutation.
 * Manages side effects like closing the dialog and showing toast messages.
 */
export const useUpdateTemplateMutation = () => {
  const queryClient = useQueryClient();

  const { setRemark, setShowDialog } = useTemplateApprovalStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
      setRemark: state.setRemark,
    })),
  );

  // Define mutation using React Query
  const { isPending, mutate } = useMutation({
    // Function that triggers the API call
    mutationFn: putTenantPendingTemplates,

    // Called on successful mutation
    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
      queryClient.invalidateQueries({
        queryKey: TTA_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: PTA_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["PROJECT_TEMPLATES"],
      });
    },

    // Called on mutation error
    onError: (error) => {
      toast.error(error.toString());
    },

    // Always called at the end (success or error)
    onSettled: () => {
      // Close the dialog after submit attempt
      setShowDialog(false);
      setRemark("");
    },
  });

  // Expose mutation and pending state
  return {
    isPending,
    mutate,
  };
};
